import express, { Router } from 'express';
import serverless from 'serverless-http';
const dotenv = require("dotenv");
//const { uuid } = require("uuidv4");
const { Client, Config, CheckoutAPI, hmacValidator } = require("@adyen/api-library");
const axios = require('axios');
var qs = require('querystringify');
const sendMail = require("../../server-controllers/sendmail")
const productSearch = require("../../server-controllers/productsearch")

const app = express();

app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

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




/* ################# API ENDPOINTS ###################### */

const router = Router();

router.get('/hello', (req, res) => res.send('Hello World!'));
//router.get('/getUserToken', (req, res) => res.json(getAll()));
router.get('/saveToken', async (req, res) => {

    await saveTokenInCT("REF_Netify", "VISA", "general4sarang@gmail.com")
    res.send('Token Saved')

});

router.get('/api/mail', sendMail);

router.post('/sessions', async (req, res) => {
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
            shopperReference: payload.customerRef,
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
router.post("/recpayment", async (req, res) => {

    try {
        const payload = req.body
        const orderRef = payload.orderNumber;

        const response = await checkout.payments({
            amount: { currency: "EUR", value: payload.amount },
            reference: orderRef,
            shopperInteraction: "ContAuth", // Continuous Authorization
            recurringProcessingModel: "Subscription",
            merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
            shopperReference: payload.customerRef,
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
router.all('/handleShopperRedirect', async (req, res) => {
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
router.post('/webhooks/notifications', async (req, res) => {
    try {
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
        await consumeEvent(notification);
        res.send('[accepted]');
    } catch (err) {
        console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
        res.status(err.statusCode).json(err.message);
    }
});



const consumeEvent = async (notification) => {
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
        return saveTokenInCT(recurringDetailReference, paymentMethod, shopperReference)

    } else if (notification.eventCode == "AUTHORISATION") {
        // webhook with payment authorisation
        console.log("Payment authorized - pspReference:" + notification.pspReference + " eventCode:" + notification.eventCode);
    } else {
        console.log("Unexpected eventCode: " + notification.eventCode);
    }
}


const saveTokenInCT = (recurringDetailReference, paymentMethod, shopperReference) => {
    console.log("saveToken Webhook called")
    // get access token
    const Auth_URL = `${process.env.VUE_APP_CT_AUTH_HOST}/oauth/token`
    return axios.post(
        Auth_URL,
        'grant_type=client_credentials',
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
                username: `${process.env.VUE_APP_CT_CLIENT_ID}`,
                password: `${process.env.VUE_APP_CT_CLIENT_SECRET}`
            }
        }
    ).then((response) => {
        // if access token found 
        if (response?.data) {
            let Auth_Token = `Bearer ${response.data.access_token}`
            let CT_API_URL = `${process.env.VUE_APP_CT_API_HOST}/${process.env.VUE_APP_CT_PROJECT_KEY}`

            //get the Customer details by email
            let query = qs.stringify({ where: `email=\"${shopperReference}\"` });
            return axios.get(`${CT_API_URL}/customers?${query}`, {
                headers: {
                    'Authorization': Auth_Token
                }
            }).then((customerData) => {
                if (customerData?.data?.results && customerData?.data?.results.length > 0) {
                    let cust = customerData?.data?.results[0];
                    // set psp ref in pspAuthorizationCode [custom field] of the custome data
                    return axios.post(`${CT_API_URL}/customers/${cust.id}`,
                        {
                            "version": cust.version,
                            "actions": [
                                {
                                    "action": "setCustomType",
                                    "type": {
                                        "id": `${process.env.VUE_APP_CT_PSPAUTH_FIELD_ID}`,
                                        "typeId": "type"
                                    }
                                },
                                {
                                    "action": "setCustomField",
                                    "name": "pspAuthorizationCode",
                                    "value": `${recurringDetailReference}**${paymentMethod}**${shopperReference}`
                                }
                            ]
                        },
                        {
                            headers: {
                                'Authorization': Auth_Token,
                                'Content-Type': 'application/json'
                            }
                        }
                    ).then((result) => {
                        console.log(result.data);
                    });
                }
            });
        }
    });



}


/*---------------Send Mail----------------------------------*/

router.post("/sendmail", sendMail);

/*--------------Product Search----------------------------------*/

router.get("/productsearch", productSearch);

app.use('/api/', router);

export const handler = serverless(app);