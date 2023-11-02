const dotenv = require("dotenv");
const axios = require('axios');
const { request, gql } = require('graphql-request')
var qs = require('querystringify');

// parsing the .env file and assigning it to process.env
dotenv.config({
  path: "./.env",
});

const productSearch = async (req, res) => {
  try {
    console.log("search params: ", req.body)
    const payload = req.body
    let qtext = payload?.search || " ";
    let qColor = payload?.color || null;
    let qSize = payload?.size || null;
    const GQL_URL = `${process.env.VUE_APP_CT_API_HOST}/${process.env.VUE_APP_CT_PROJECT_KEY}/graphql/`
    let CT_API_URL = `${process.env.VUE_APP_CT_API_HOST}/${process.env.VUE_APP_CT_PROJECT_KEY}`
    let requestHeaders = null;

    //NLP Tokenization of search string
    let tokenized = await axios.get(`${process.env.NLP_API}/getTokenizedKeywords?search=${qtext}`);

    console.log("NLPTokens: ", tokenized.data)

    let queryObj = tokenized.data

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
        requestHeaders = {
          "Authorization": `Bearer ${response.data.access_token}`
        }

        // if categorySlug found find categoryid and use it in Documentfilter
        if (payload.categorySlug) {
          const categoryQuery = gql`
          query categories($locale: Locale! , $where: String!, $sort: [String!] = []) {
            categories(sort: $sort, where: $where) {
              count
              total
              results {
                id
                slug(locale: $locale)
                name(locale: $locale)
              }
            }
          }
        `;
          const categoryQueryVariables = {
            "locale": "en",
            "sort": [],
            "where": `slug(en="${payload.categorySlug}")`
          }
          return request(GQL_URL, categoryQuery, categoryQueryVariables, requestHeaders)
        } else {

          Promise.resolve(null);
        }
      }
    }).then((categoryData) => {
      let categortId = null;
      let query = {
        "text.en": `\"${qtext}\"`,
        "limit": 10,
        "offset": payload?.offset || 0,
        "sorts": null,
        "priceCurrency": "EUR",
        "priceCountry": "DE",
        //"priceCustomerGroup": null,
        //"priceChannel": null
      }
      if (categoryData && categoryData.categories && categoryData.categories.count > 0) {
        categortId = categoryData.categories?.results[0]?.id || null
        query["categories.id"] = `\"${categortId}\"`
      }

      query = qs.stringify(query);

      //Filter and Facate will be repeated so cannot be added as object keys. Add them one by one as Query string
      query = query + "&" + qs.stringify({ "filter": `variants.price.centAmount:range (* to ${maxPrice})` });
      if (qSize) {
        let allSizeStrArr = qSize.split(",").map((x) => '"' + x + '"');
        console.log("sizes", allSizeStrArr.toString())
        query = query + "&" + qs.stringify({ "filter": `variants.attributes.size:${allSizeStrArr.toString()}` });
      }
      if (qColor) {
        let allColorStrArr = qColor.split(",").map((x) => '"' + x + '"');
        console.log("colors", allColorStrArr.toString())
        query = query + "&" + qs.stringify({ "filter": `variants.attributes.color.label.en:${allColorStrArr.toString()}` });
      }

      //Facets
      query = query + "&" + qs.stringify({ "facet": "variants.attributes.color.label.en" });
      query = query + "&" + qs.stringify({ "facet": "variants.attributes.size" });
      console.log(query)
      return axios.get(`${CT_API_URL}/product-projections/search?${query}`, {
        headers: requestHeaders
      })
    }).then((searchData) => {
      console.log("returned search data")
      res.json(searchData.data);
    }).catch((err) => {
      console.error(`Error: ${err} `);
      res.json({ err });
    });

  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.statusCode} `);
    res.status(err.statusCode).json(err.message);
  }
}




module.exports = productSearch