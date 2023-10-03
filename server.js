const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const serverless = require('serverless-http');
//const { uuid } = require("uuidv4");
const { Client, Config, CheckoutAPI, hmacValidator } = require("@adyen/api-library");

const STATIC = path.resolve("./dist");
const INDEX = path.resolve(STATIC, "index.html");
// init app
const app = express();



// setup request logging
app.use(morgan("dev"));
// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Static content
app.use(express.static(STATIC));

// enables environment variables by
// parsing the .env file and assigning it to process.env
dotenv.config({
    path: "./.env",
});

// Adyen Node.js API library boilerplate (configuration, etc.)
const config = new Config();
config.apiKey = process.env.ADYEN_API_KEY;
const client = new Client({ config });
client.setEnvironment("TEST");
const checkout = new CheckoutAPI(client);

//------------------------------- recurring payment code---------------------------

const SHOPPER_REFERENCE = "AiopsShopper_IOfW3k9G2PvXFu2j";
var tokens = [{
    recurringDetailReference: "F3NH25PS3GCM9J65",
    paymentMethod: "visa",
    shopperReference: "AiopsShopper_IOfW3k9G2PvXFu2j"
}];

const getAll = () => {
    return tokens
}

const put = (pToken, pPaymentMethod, pShopperReference) => {
    tokens.push({ recurringDetailReference: pToken, paymentMethod: pPaymentMethod, shopperReference: pShopperReference })
    console.log("UserToken", tokens)
}

const remove = (pToken) => {
    let indexToRemove = tokens.findIndex(obj => obj.recurringDetailReference === pToken);
    tokens.splice(indexToRemove, 1)[0];
}

//------------------------------------------------------------------------------------------

/* ################# API ENDPOINTS ###################### */

app.get('/api/hello', (req, res) => res.send('Hello World!'));
app.get('/api/getUserToken', (req, res) => res.json(getAll()));
// Invoke /sessions endpoint
app.post("/api/sessions", async (req, res) => {

    try {
        // Unique ref for the transaction
        // const orderRef = uuid();
        // Determine host (for setting returnUrl)
        const protocol = req.socket.encrypted ? 'https' : 'http';
        const host = req.get('host');
        const payload = req.body
        const orderRef = payload.orderNumber;


        // Ideally the data passed here should be computed based on business logic
        const response = await checkout.sessions({
            amount: { currency: "EUR", value: payload.amount }, // Value is 100€ in minor units
            countryCode: "NL",
            merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT, // Required: your merchant account
            reference: orderRef, // Required: your Payment Reference
            // set lineItems required for some payment methods (ie Klarna)
            lineItems: [
                { quantity: 1, amountIncludingTax: 5000, description: "Sunglasses" },
                { quantity: 1, amountIncludingTax: 5000, description: "Headphones" }
            ],
            returnUrl: `${protocol}://${host}/api/handleShopperRedirect?orderRef=${orderRef}`, // Required `returnUrl` param: Set redirect URL required for some payment methods
            // recurring payment settings
            shopperReference: SHOPPER_REFERENCE,
            shopperInteraction: "Ecommerce",
            recurringProcessingModel: "Subscription",
            enableRecurring: true
        });
        res.json({ response, clientKey: process.env.ADYEN_CLIENT_KEY });

    } catch (err) {
        console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
        res.status(err.statusCode).json(err.message);
    }
});

// recurring payment api
app.post("/api/recpayment", async (req, res) => {

    try {
        const payload = req.body
        const orderRef = payload.orderNumber;

        const response = await checkout.payments({
            amount: { currency: "EUR", value: payload.amount },
            reference: orderRef,
            shopperInteraction: "ContAuth", // Continuous Authorization
            recurringProcessingModel: "Subscription",
            merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
            shopperReference: SHOPPER_REFERENCE,
            paymentMethod: {
                storedPaymentMethodId: payload.recReference
            }
        });
        res.json({ response });

    } catch (err) {
        console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
        res.status(err.statusCode).json(err.message);
    }
});

// Handle all redirects from payment type
app.all("/api/handleShopperRedirect", async (req, res) => {
    // Create the payload for submitting payment details
    const redirect = req.method === "GET" ? req.query : req.body;
    const details = {};
    if (redirect.redirectResult) {
        details.redirectResult = redirect.redirectResult;
    } else if (redirect.payload) {
        details.payload = redirect.payload;
    }

    try {
        const response = await checkout.paymentsDetails({ details });
        // Conditionally handle different result codes for the shopper
        switch (response.resultCode) {
            case "Authorised":
                res.redirect("/result/success");
                break;
            case "Pending":
            case "Received":
                res.redirect("/result/pending");
                break;
            case "Refused":
                res.redirect("/result/failed");
                break;
            default:
                res.redirect("/result/error");
                break;
        }
    } catch (err) {
        console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
        res.redirect("/result/error");
    }
});

/* ################# end API ENDPOINTS ###################### */


/* ################# WEBHOOK ###################### */
app.post("/api/webhooks/notifications", async (req, res) => {
    // YOUR_HMAC_KEY from the Customer Area
    const hmacKey = process.env.ADYEN_HMAC_KEY;
    const validator = new hmacValidator()

    // NotificationRequest JSON
    const notificationRequest = req.body;

    // Fetch first (and only) NotificationRequestItem
    const notification = notificationRequest.notificationItems[0].NotificationRequestItem;

    // Handle the notification
    if (!validator.validateHMAC(notification, hmacKey)) {
        // invalid hmac: do not send [accepted] response
        console.log("Invalid HMAC signature: " + notification);
        res.status(401).send('Invalid HMAC signature');
        return;
    }

    // Process the notification asynchronously based on the eventCode
    consumeEvent(notification);
    res.send('[accepted]');
});

// Process payload
// function consumeEvent(notification) {
//     // Add item to DB, queue or different thread, we just log it for now
//     //const merchantReference = notification.merchantReference;
//     //const eventCode = notification.eventCode;
//     console.log("-- webhook payload ------");
//     console.log(notification);
//     //console.log('merchantReference:' + merchantReference + " eventCode:" + eventCode);
// }

function consumeEvent(notification) {
    // valid hmac: process event

    const shopperReference = notification.additionalData['recurring.shopperReference'];

    // read about eventcode "RECURRING_CONTRACT" here: https://docs.adyen.com/online-payments/tokenization/create-and-use-tokens?tab=subscriptions_2#pending-and-refusal-result-codes-1
    if (notification.eventCode == "RECURRING_CONTRACT" && shopperReference) {
        // webhook with recurring token
        const recurringDetailReference = notification.additionalData['recurring.recurringDetailReference'];
        const paymentMethod = notification.paymentMethod;

        console.log("Recurring authorized - recurringDetailReference:" + recurringDetailReference + " shopperReference:" + shopperReference +
            " paymentMethod:" + paymentMethod);

        // save token
        put(recurringDetailReference, paymentMethod, shopperReference)

    } else if (notification.eventCode == "AUTHORISATION") {
        // webhook with payment authorisation
        console.log("Payment authorized - pspReference:" + notification.pspReference + " eventCode:" + notification.eventCode);
    } else {
        console.log("Unexpected eventCode: " + notification.eventCode);
    }
}


/* ################# end WEBHOOK ###################### */



/* ################# CLIENT ENDPOINTS ###################### */


// Handles any requests that doesn't match the above
// All GET request handled by INDEX file
app.get("*", function (req, res) {
    res.sendFile(INDEX);
});


/* ################# end CLIENT ENDPOINTS ###################### */


// // Start server
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;
module.exports.handler = serverless(app);