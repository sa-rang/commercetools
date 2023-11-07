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
            enableRecurring: true,
            //Pre-Auth settings
            additionalData: {
                authorisationType: "PreAuth"
            }
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

// payment capture api
router.post("/capture", async (req, res) => {
    try {
        const payload = req.body
        const Auth_URL = `${process.env.VUE_APP_CT_AUTH_HOST}/oauth/token`
        //Step1: Get Access Token
        let Token = await axios.post(
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
        )
        // if access token found 
        if (Token?.data) {
            let Auth_Token = `Bearer ${Token.data.access_token}`
            let CT_API_URL = `${process.env.VUE_APP_CT_API_HOST}/${process.env.VUE_APP_CT_PROJECT_KEY}`

            //get order data
            let orderData = await axios.get(`${CT_API_URL}/orders/order-number=${payload?.orderNumber}`, {
                headers: {
                    'Authorization': Auth_Token
                }
            })

            if (orderData?.data?.paymentInfo?.payments && orderData?.data?.paymentInfo?.payments.length > 0) {

                let orderAmount = orderData?.data?.totalPrice?.centAmount || 0
                let orderCurrency = orderData?.data?.totalPrice?.currencyCode || "EUR"
                let orderNumber = orderData?.data?.orderNumber
                let orderId = orderData?.data?.id
                let orderVersion = orderData?.data?.version


                let paymentObj = orderData?.data?.paymentInfo?.payments[0];
                let paymentId = paymentObj?.id || ""

                //get the payment object
                let payamentData = await axios.get(`${CT_API_URL}/payments/${paymentId}`, {
                    headers: {
                        'Authorization': Auth_Token
                    }
                })

                if (payamentData?.data && payamentData?.data?.paymentMethodInfo && payamentData?.data?.paymentMethodInfo?.paymentInterface) {
                    let pspRef = payamentData?.data?.paymentMethodInfo?.paymentInterface;
                    console.log(`capture PSP [${pspRef}]  found for `, orderNumber)
                    const paymentCaptureRes = await checkout.captures(pspRef, {
                        amount: { currency: orderCurrency, value: orderAmount },
                        reference: orderNumber,
                        merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
                    });


                    if (paymentCaptureRes && paymentCaptureRes?.status && paymentCaptureRes?.status.toLowerCase() == "received") {
                        //  update order status as Confirmed & payState as Paid and ShipingState as Shipped
                        console.log("payment Capture:", paymentCaptureRes?.status)
                        let orderUpdateRes = await axios.post(`${CT_API_URL}/orders/${orderId}`,
                            {
                                "version": orderVersion,
                                "actions": [
                                    {
                                        "action": "changeOrderState",
                                        "orderState": `Confirmed`
                                    },
                                    {
                                        "action": "changeShipmentState",
                                        "shipmentState": `Shipped`
                                    },
                                    {
                                        "action": "changePaymentState",
                                        "paymentState": `Paid`
                                    }
                                ]
                            },
                            {
                                headers: {
                                    'Authorization': Auth_Token,
                                    'Content-Type': 'application/json'
                                }
                            }
                        )

                        console.log("order updated")

                        res.json({ capture: paymentCaptureRes?.status, order: orderUpdateRes?.data });
                    }

                }
            }
        }
    } catch (err) {
        console.error(`Error: ${err.message}`);
        res.json({ Error: err.message });
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
        //console.log(JSON.stringify(notification))
        console.log("Payment authorized - pspReference:" + notification.pspReference + " eventCode:" + notification.eventCode + "merchantReference" + notification.merchantReference);
        return savePSPonOrderInCT(notification.pspReference, notification.merchantReference)
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
                                    "name": "pspAuthCode",
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
                    }).catch((err) => {
                        console.log(err)
                    });;
                }
            }).catch((err) => {
                console.log(err)
            });;
        }
    });
}

const savePSPonOrderInCT = (pspRef, orderNumber) => {
    console.log("savePSP for Future Capture")
    // get access token
    const Auth_URL = `${process.env.VUE_APP_CT_AUTH_HOST}/oauth/token`
    let orderId = null;
    let orderVersion = 1;

    //Step1: Get Access Token
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

            //Step:2 get the order details

            return axios.get(`${CT_API_URL}/orders/order-number=${orderNumber}`, {
                headers: {
                    'Authorization': Auth_Token
                }
            }).then((orderData) => {


                if (orderData?.data?.paymentInfo?.payments && orderData?.data?.paymentInfo?.payments.length > 0) {
                    orderId = orderData?.data?.id;
                    orderVersion = orderData?.data?.version;
                    let paymentObj = orderData?.data?.paymentInfo?.payments[0];
                    let paymentId = paymentObj?.id || ""
                    console.log("order with payment obj found")
                    //Step 3: get the payment object
                    return axios.get(`${CT_API_URL}/payments/${paymentId}`, {
                        headers: {
                            'Authorization': Auth_Token
                        }
                    }).catch((err) => {
                        console.log(err)
                    });
                }
            }).then((payData) => {
                if (payData?.data) {
                    let paymentObj = payData?.data;
                    let paymentId = paymentObj?.id || ""
                    let payVersion = paymentObj?.version
                    console.log("payment Obj found: ", paymentId)
                    //Step 4:  set pspref in payment object 
                    return axios.post(`${CT_API_URL}/payments/${paymentId}`,
                        {
                            "version": payVersion,
                            "actions": [
                                {
                                    "action": "setMethodInfoInterface",
                                    "interface": `${pspRef}`
                                }
                            ]
                        },
                        {
                            headers: {
                                'Authorization': Auth_Token,
                                'Content-Type': 'application/json'
                            }
                        }
                    ).catch((err) => {
                        console.log(err)
                    });
                }
            }).then((payUpdateRes) => {


                if (payUpdateRes?.data) {
                    console.log("start order update to 'confirm'")
                    //Step 5:  update order status as BalanceDue on Authorization
                    return axios.post(`${CT_API_URL}/orders/${orderId}`,
                        {
                            "version": orderVersion,
                            "actions": [
                                {
                                    "action": "changePaymentState",
                                    "paymentState": `BalanceDue`
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
                        console.log("updated order status:", result?.data?.orderState);

                    }).catch((err) => {
                        console.log(err)
                    });
                }
            }).catch((err) => {
                console.log(err)
            });;
        }
    }).catch((err) => {
        console.log(err)
    });;
}


/*---------------Send Mail----------------------------------*/

router.post("/sendmail", sendMail);

/*--------------Product Search----------------------------------*/

router.post("/productsearch", productSearch);

app.use('/api/', router);

export const handler = serverless(app);