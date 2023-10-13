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
        const request = mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: {
                            Email: "general4sarang@gmail.com",
                            Name: "Aiops CT Support"
                        },
                        To: [
                            {
                                Email: "schaudhary@aiopsgroup.com",
                                Name: "Sarang Chaudhary"
                            }
                        ],
                        Subject: "Your email flight plan!",
                        TextPart: "Dear Sarang Chaudhary, Your order has been placed! text part",
                        HTMLPart: "<h2>Dear Sarang Chaudhary</h2><br />Your order has been placed!"
                    }
                ]
            })

        request.then((result) => {
            console.log(JSON.stringify(result.body))
            res.send('Ok! Aiops, Mail Sent');
        })

    } catch (err) {
        console.error(`Error: ${err.message}, error code: ${err.statusCode}`);
        res.status(err.statusCode).json(err.message);
    }
}


module.exports = sendmail