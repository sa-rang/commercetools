const dotenv = require("dotenv");
const axios = require('axios');
const { request, gql } = require('graphql-request')

// parsing the .env file and assigning it to process.env
dotenv.config({
    path: "./.env",
});

const CT_colors = []

const productSearch = async (req, res) => {
    try {
        let qtext = req?.query?.search || " ";
        console.log("getProducts called")
        // const response = null//await manager.process('en', qtext);
        // let Token_b = req.headers.authorization
        // console.log(Token_b)

        const response = await axios.post(
            'https://api.apilayer.com/nlp/tokenizer',
            qtext,
            {
                params: {
                    'lang': 'en'
                },
                headers: {
                    'apikey': process.env.APILAYER_KEY,
                }
            }
        );

        let queryObj = {}
        console.log(response.data)
        if (response && response?.data && response?.data?.result && response?.data?.result?.length) {
            response?.data?.result.map((x) => {
                if (x.type?.is_digit) {
                    queryObj["price"] = x?.text || 10000000;
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
            res.json(searchData);
        }).catch((err) => {
            res.json({ err });
        });

    } catch (err) {
        console.error(`Error: ${err.message}, error code: ${err.statusCode} `);
        res.status(err.statusCode).json(err.message);
    }
}




module.exports = productSearch