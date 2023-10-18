const dotenv = require("dotenv");
const axios = require('axios');
const { NlpManager } = require('node-nlp');
const manager = new NlpManager({ languages: ['en'], forceNER: true });
const { request, gql } = require('graphql-request')

// parsing the .env file and assigning it to process.env
dotenv.config({
    path: "./.env",
});

const productSearch = async (req, res) => {
    try {
        let qtext = req?.query?.search || " ";
        console.log("getProducts called")
        const response = await manager.process('en', qtext);
        // let Token_b = req.headers.authorization
        // console.log(Token_b)

        let queryObj = {}
        if (response && response?.classifications.length) {
            response?.classifications.map((x) => {
                if (x.intent.includes("price") && !queryObj["price"]) {
                    let valueObj = response.sourceEntities.find((x) => x.typeName = "number")
                    queryObj["price"] = valueObj?.text || 10000000;
                } else if (x.intent.includes("color") && !queryObj["color"]) {
                    let valueObj = x.intent.split(".")
                    queryObj["color"] = valueObj[1]
                }
                else if (x.intent.includes("product") && !queryObj["product"]) {
                    let valueObj = x.intent.split(".")
                    queryObj["product"] = valueObj[1]
                }
            })
            console.log(queryObj)
        }

        let maxPrice = queryObj?.price ? queryObj?.price * 100 : 1000000000

        // get access token
        const Auth_URL = `${process.env.VUE_APP_CT_AUTH_HOST}/oauth/token`
        axios.post(
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
                let GQL_URL = `${process.env.VUE_APP_CT_API_HOST}/${process.env.VUE_APP_CT_PROJECT_KEY}/graphql/`
                console.log("auth token", Auth_Token)
                const document = gql`
                query products(
                    $locale: Locale!
                    $limit: Int!
                    $offset: Int!
                    $priceSelector: PriceSelectorInput!
                    $sorts: [String!] = []
                    $filters: [SearchFilterInput!] = [],
                    $text: String = ""
                  ) {
                    productProjectionSearch(
                      locale: $locale
                      text: $text
                      limit: $limit
                      offset: $offset
                      sorts: $sorts
                      priceSelector: $priceSelector
                      filters: $filters
                    ) {
                      total
                      results {
                        # better never select id or cache breaks
                        # https://github.com/apollographql/apollo-client/issues/9429
                        productId: id
                        name(locale: $locale)
                        slug(locale: $locale)

                        masterVariant {
                            # better never select id or cache breaks
                            # https://github.com/apollographql/apollo-client/issues/9429
                            variantId: id
                            sku
                            images {
                                 url 
                            }
                            attributesRaw {
                              name
                              value
                            }
                            scopedPrice {
                              value {
                                currencyCode
                                centAmount
                                fractionDigits
                              }
                              discounted {
                                discount {
                                  name(locale: $locale)
                                }
                                value {
                                  currencyCode
                                  centAmount
                                  fractionDigits
                                }
                              }
                              country
                            }
                          }
                        }
                      }
                    }
                `

                const variables = {
                    "locale": "en",
                    "text": qtext,
                    "limit": 100,
                    "offset": 0,
                    "sorts": null,
                    "priceSelector": {
                        "currency": "EUR",
                        "country": "DE",
                        "channel": null,
                        "customerGroup": null
                    },
                    "filters": [
                        {
                            "model": {
                                "range": {
                                    "path": "variants.scopedPrice.value.centAmount",
                                    "ranges": [{ "from": "*", "to": `${maxPrice}` }]
                                }
                            }
                        }
                    ]
                }
                const requestHeaders = {
                    "Authorization": Auth_Token
                }

                return request(GQL_URL, document, variables, requestHeaders)
            }
        }).then((searchData) => {
            console.log("gql")
            res.json(searchData);
        }).catch((err) => {
            res.json({ err });
        });

    } catch (err) {
        console.error(`Error: ${err.message}, error code: ${err.statusCode} `);
        res.status(err.statusCode).json(err.message);
    }
}

const nlpTrainer = () => {
    // Adds the utterances and intents for the NLP

    //price trainer
    manager.addDocument('en', 'under 100', 'price');
    manager.addDocument('en', 'under 200', 'price');
    manager.addDocument('en', 'under 300', 'price');
    manager.addDocument('en', 'under 400', 'price');
    manager.addDocument('en', 'under 500', 'price');
    manager.addDocument('en', 'under 600', 'price');
    manager.addDocument('en', 'under 700', 'price');
    manager.addDocument('en', 'under 800', 'price');
    manager.addDocument('en', 'under 900', 'price');
    manager.addDocument('en', 'under 1500', 'price');
    manager.addDocument('en', 'under 2000', 'price');
    manager.addDocument('en', 'under 2500', 'price');
    manager.addDocument('en', 'under 3000', 'price');
    manager.addDocument('en', 'under 3500', 'price');
    manager.addDocument('en', 'under 4000', 'price');
    manager.addDocument('en', 'under 4500', 'price');
    manager.addDocument('en', 'under 5000', 'price');


    //color trainer
    manager.addDocument('en', 'red', 'color.red');
    manager.addDocument('en', 'green', 'color.green');
    manager.addDocument('en', 'blue', 'color.blue');
    manager.addDocument('en', 'white', 'color.white');
    manager.addDocument('en', 'black', 'color.black');
    manager.addDocument('en', 'grey', 'color.grey');
    manager.addDocument('en', 'yellow', 'color.yellow');
    manager.addDocument('en', 'beige', 'color.beige');
    manager.addDocument('en', 'multicolored', 'color.multicolored');
    manager.addDocument('en', 'brown', 'color.brown');
    manager.addDocument('en', 'pink', 'color.pink');
    manager.addDocument('en', 'silver', 'color.silver');
    manager.addDocument('en', 'gold', 'color.gold');
    manager.addDocument('en', 'oliv', 'color.oliv');
    manager.addDocument('en', 'orange', 'color.orange');
    manager.addDocument('en', 'turquoise', 'color.turquoise');
    manager.addDocument('en', 'petrol', 'color.petrol');
    manager.addDocument('en', 'purple', 'color.purple');

    //productType trainer
    manager.addDocument('en', 'bag', 'product.bag');
    manager.addDocument('en', 'jacket', 'product.jacket');
    manager.addDocument('en', 'jeans', 'product.jeans');
    manager.addDocument('en', 'shoes', 'product.shoes');
    manager.addDocument('en', 'shirt', 'product.shirt');
    manager.addDocument('en', 'sports', 'product.sports');
    manager.addDocument('en', 'handbag', 'product.handbag');
    manager.addDocument('en', 'coat', 'product.coat');
    manager.addDocument('en', 't-shirt', 'product.t-shirt');
    manager.addDocument('en', 'sneaker', 'product.sneaker');
    manager.addDocument('en', 'polo', 'product.polo');
    manager.addDocument('en', 'sweater', 'product.sweater');
    manager.addDocument('en', 'flip flop', 'product.flipflop');
    manager.addDocument('en', 'belt', 'product.belt');
    manager.addDocument('en', 'Bracelet', 'product.Bracelet');
    manager.addDocument('en', 'Scarf', 'product.Scarf');
    manager.addDocument('en', 'Perfume', 'product.Perfume');
    manager.addDocument('en', 'Phone cover', 'product.Phone cover');



    // Train also the NLG
    // manager.addAnswer('en', 'price.100', '100');
    // manager.addAnswer('en', 'price.200', '200');
    // manager.addAnswer('en', 'price.300', '300');
    // manager.addAnswer('en', 'price.400', '400');
    // manager.addAnswer('en', 'price.500', '500');
    // manager.addAnswer('en', 'price.600', '600');
    // manager.addAnswer('en', 'price.700', '700');
    // manager.addAnswer('en', 'price.800', '800');
    // manager.addAnswer('en', 'price.900', '900');
    // manager.addAnswer('en', 'price.1000', '1000');

    // manager.addAnswer('en', 'color.red', 'red');
    // manager.addAnswer('en', 'color.green', 'green');
    // manager.addAnswer('en', 'color.blue', 'blue');
    // manager.addAnswer('en', 'color.white', 'white');
    // manager.addAnswer('en', 'color.black', 'black');
    // manager.addAnswer('en', 'color.yellow', 'yellow');

    manager.train().then(() => {
        manager.save();
        console.log("NLP Trained!")
    })

}

(() => {
    nlpTrainer()
})();


module.exports = productSearch