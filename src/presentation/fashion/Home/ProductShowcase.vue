<template>
    <div class="product-showcase">
        <div class="shop-wrapper" v-if="searchResult.length">
            <h2 class="text-center mb-3">Most Popular</h2>
            <div class="row">
                <ProductThumbnail v-for="product in searchResult" :key="product.productId" :product="formatProduct(product)"
                    :addToCart="addToCart" />
            </div>
        </div>
    </div>
</template>
<script >

import { ref, onMounted } from 'vue';
import useQuery from 'hooks/useQueryFacade';
import gql from 'graphql-tag';
import ProductThumbnail from '../ProductList/ProductThumbnail/ProductThumbnail.vue';
import useProductTools from 'hooks/useProductTools';
import useCartTools from 'hooks/useCartTools';


export default {
    components: { ProductThumbnail },
    setup() {

        const queryText = ref("women");
        const priceRange1 = ref(1)
        const priceRange2 = ref(9999)
        const searchResult = ref([])
        const limit = ref(4);

        const { addLine } = useCartTools();
        const {
            formatProduct
        } = useProductTools();



        const addToCart = (sku, quantity = 1) =>
            addLine(sku, quantity);




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

        onMounted(() => {
            //Call oncreated
            goFind()

        })

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
                },
                skip: false,
            });
        }



        return { searchResult, formatProduct, addToCart }
    }
}

</script>

<style lang="scss" scoped>
.product-showcase {}
</style>