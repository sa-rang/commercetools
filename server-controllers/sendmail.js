const dotenv = require("dotenv");
const Mailjet = require('node-mailjet');

// parsing the .env file and assigning it to process.env
dotenv.config({
    path: "./.env",
});

const mailjet = Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE,
);

const sendmail = async (req, res) => {
    try {
        const customerEmail = req.body.customerEmail;
        const customerName = req.body.customerName;
        const orderDetails = req.body.orderDetails;

        let mailFrom = {
            Email: "general4sarang@gmail.com",
            Name: "Aiops CT Support"
        }

        let mailTo = [
            {
                Email: customerEmail,
                Name: customerName
            }
        ];

        let mailCC = []
        if (process.env.Test_Mail_CC) {
            mailCC.push(
                {
                    Email: "schaudhary@aiopsgroup.com",
                    Name: "Sarang Chaudhary"
                },
                {
                    Email: "sroy@aiopsgroup.com",
                    Name: "Souvit Roy"
                }
            )
        }

        const orderRef = orderDetails.orderNumber;

        let fractionDigitsBase = 10 ** orderDetails.totalPrice.fractionDigits;

        let currencyCode = orderDetails.totalPrice.currencyCode;
        let subTotal = orderDetails.lineItems.reduce(
            (acc, li) => acc + li.totalPrice.centAmount,
            0
        ) / fractionDigitsBase

        let shippingCharges = orderDetails.shippingInfo.price.centAmount / fractionDigitsBase;
        let orderTotal = orderDetails.totalPrice.centAmount / fractionDigitsBase;


        let mailBody = `
        <table style="width:95%"> 
        <tbody>
         <tr> 
            <td ><h3 >Hello, ${customerName}</h3></td> 
         </tr> 
         <tr> 
            <td ><p>Your order <span style="color:#00c6c2">#${orderRef}</span> has been placed!</p></td> 
        </tr> 
        <tr> 
            <td ><h3 style="border-bottom:1px solid #ccc">Order Summary</h3></td> 
         </tr> 
        </tbody>
       </table>
        <table style="width:95%"> 
           <tbody>
            <tr> 
             <td colspan="2"></td> 
            </tr> 
            <tr> 
             <td>Item</td> 
             <td>Quantity</td> 
             <td>Price</td>
            </tr> 
            ${orderDetails.lineItems.map((eachItem) => {
            return `<tr>
                    <td>${eachItem.name}</td>
                    <td>${eachItem.quantity}</td>
                    <td>${eachItem.totalPrice.currencyCode}. ${eachItem.totalPrice.centAmount / fractionDigitsBase}</td>
                    </tr>`
        }).join("")
            } 
           </tbody >
          </table >
          <br style="border-bottom:1px solid #ccc" / >
        <table style="width:95%"> 
           <tbody>
           <tr> 
             <td colspan="2" ><h4 style="border-bottom:1px solid #ccc">Order Total</h4></td> 
            </tr>
            <tr> 
             <td colspan="2"></td> 
            </tr> 
            <tr> 
             <td> Item Subtotal: </td> 
             <td> ${currencyCode}. ${subTotal} </td> 
            </tr> 
            <tr> 
             <td> Shipping &amp; Handling: </td> 
             <td>  ${currencyCode}. ${shippingCharges} </td> 
            </tr> 
            <tr> 
             <td colspan="2"> <p></p> </td> 
            </tr> 
            <tr> 
             <td colspan="2"> <p></p> </td> 
            </tr> 
            <tr> 
             <td > <strong> Order Total: </strong> </td> 
             <td > <strong> ${currencyCode}. ${orderTotal} </strong> </td> 
            </tr> 
           </tbody>
          </table>
          <br/>
          <p>We hope to see you again soon.</p>
          <p><strong> Aiops Commerce </strong></p>
        `


        //Mail jet Send mail
        const request = mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: mailFrom,
                        To: mailTo,
                        cc: mailCC,
                        Subject: `Your Aiops Commerce order #${orderRef} `,
                        TextPart: `Dear ${customerName}, Your order #${orderRef} has been placed!`,
                        HTMLPart: mailBody
                    }
                ]
            })

        request.then((result) => {
            // console.log(JSON.stringify(result.body))
            res.json({ result: result.body });
        })

    } catch (err) {
        console.error(`Error: ${err.message}, error code: ${err.statusCode} `);
        res.status(err.statusCode).json(err.message);
    }
}


module.exports = sendmail