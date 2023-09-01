
<template>
    <div class="container pt-80 pb-100">

        <div class="row mt-30">
            <div class="col-md-6">
                <h3>Search [Experimental]</h3>
                <input type="text" placeholder="Search text" v-model="queryText" />
                <label class="mt-30" for="price1">Price:</label>
                <input type="number" placeholder="Price From" v-model="priceRange1" name="price1" />
                <input type="number" placeholder="Price To" v-model="priceRange2" name="price2" />

                <label class="mt-30" for="price1">Number of Results:</label>
                <input type="number" placeholder="Limit" v-model="limit" name="price1" />

                <button class="mt-30" @click="goFind">Search Products</button>
            </div>
            <div class="col-md-6">
                <h3>Search Results</h3>
                <div class="border" v-for="each in searchResult" :key="each.productId">
                    <img :src="each.masterVariant.images[0].url" width="30" />
                    <span>{{ each.name }}</span>
                    <span> &nbsp;| &nbsp;{{ each.masterVariant.scopedPrice.value.currencyCode }}&nbsp;
                        {{ each.masterVariant.scopedPrice.value.centAmount / 100 }} </span>
                </div>
            </div>
        </div>
    </div>
</template>


<script >

import { ref } from 'vue';

import useQuery from 'hooks/useQueryFacade';
import gql from 'graphql-tag';


export default {

    setup() {

        const queryText = ref("");
        const priceRange1 = ref(1)
        const priceRange2 = ref(300)
        const searchResult = ref([])
        const limit = ref(15);



        const query = (expand) => gql`
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
        ${expand.variants
                ? `variants {
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
        }`
                : ''
            }
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
`;


        const goFind = () => {
            let qVar = {
                "locale": "en",
                "text": queryText.value,
                "limit": limit.value,
                "offset": 0,
                "sorts": null,
                "priceSelector": {
                    "currency": "USD",
                    "country": "US",
                    "channel": null,
                    "customerGroup": null
                },
                "filters": [

                    {
                        "model": {
                            "range": {
                                "path": "variants.scopedPrice.value.centAmount",
                                "ranges": [{ "from": (priceRange1.value * 100).toString(), "to": (priceRange2.value * 100).toString() }]
                            }
                        }
                    }
                ]
            }
            useQuery(query(false), {
                variables: qVar,
                onCompleted: (data) => {
                    if (!data) {
                        return;
                    }
                    searchResult.value = data?.productProjectionSearch?.results;
                    console.log(data)

                },
                skip: false,
            });
        }




        return {
            queryText,
            priceRange1,
            priceRange2,
            limit,
            searchResult,

            goFind
        };
    },
};


</script>

<style lang="scss" scoped>
.search {}
</style>
