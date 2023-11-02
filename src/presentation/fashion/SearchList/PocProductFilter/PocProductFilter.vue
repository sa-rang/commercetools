<template>
    <div>
        <div class="poc-product-filter">
            <div class="border-bottom mb-3 d-flex justify-content-between">
                <strong>Filters </strong>
                <button class="btn-clearall mb-2" @click="clearFilter">Clear All</button>
            </div>
            <div v-for="eachFilter in filtersAll" :key="eachFilter.filter">
                <div v-if="eachFilter.filter == 'color'" class="">
                    <strong>{{ eachFilter.filter }}</strong>
                    <div class="overflow-auto mb-3" style="max-height: 200px;">
                        <div v-for="eachValue, index in eachFilter.values" :key="index">
                            <input class="check mr-2" :value="eachValue.term" v-model="selectedColorFilterArray"
                                @click="toggelFilter" type="checkbox" />
                            <span>
                                {{ eachValue.term }}
                                <span class="font-italic font-weight-lighter ml-1">({{ eachValue.count }})</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div v-else-if="eachFilter.filter == 'size'">
                    <strong>{{ eachFilter.filter }}</strong>
                    <div class="overflow-auto mb-3" style="max-height: 200px;">
                        <div v-for="eachValue, index in eachFilter.values" :key="index">
                            <input class="check mr-2" :value="eachValue.term" v-model="selectedSizeFilterArray"
                                @click="toggelFilter" type="checkbox" />
                            <span>
                                {{ eachValue.term }}
                                <span class="font-italic font-weight-lighter ml-1">({{ eachValue.count }})</span>
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script >
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
    props: {
        filters: {
            type: Object,
            required: true,
        }
    },
    setup(props) {
        const route = useRoute();
        const router = useRouter();
        const selectedSizeFilterArray = ref([])
        const selectedColorFilterArray = ref([])

        const filtersAll = computed(() => {
            let filt = [];
            let keys = Object.keys(props.filters);
            keys.map((eachKey) => {
                if (eachKey == "variants.attributes.color.label.en") {
                    let facetObj = props.filters["variants.attributes.color.label.en"]
                    if (facetObj?.terms && facetObj?.terms.length > 0) {
                        filt.push({
                            filter: "color",
                            values: facetObj.terms
                        })
                    }
                } else if (eachKey == "variants.attributes.size") {
                    let facetObj = props.filters["variants.attributes.size"]
                    if (facetObj?.terms && facetObj?.terms.length > 0) {
                        filt.push({
                            filter: "size",
                            values: facetObj.terms
                        })
                    }
                }
            })
            return filt;
        });

        onMounted(async () => {

        });

        watch(selectedSizeFilterArray, (sizeArr) => {
            if (sizeArr && sizeArr.length > 0) {
                let SizeValue = sizeArr.join(",")
                console.log("sizevalue", SizeValue)
                router.push({
                    ...route,
                    params: {
                        ...route.params,
                    },
                    query: {
                        ...route.query,
                        size: SizeValue,
                    }
                });
            }
        });

        watch(selectedColorFilterArray, (colorArr) => {
            if (colorArr && colorArr.length > 0) {
                let ColorValue = colorArr.join(",")
                console.log("colorvalue", ColorValue)
                router.push({
                    ...route,
                    params: {
                        ...route.params,
                    },
                    query: {
                        ...route.query,
                        color: ColorValue,
                    }
                });
            }
        });


        const clearFilter = () => {
            selectedSizeFilterArray.value = []
            selectedColorFilterArray.value = []
            const queryParams = { ...route.query };
            if (queryParams?.size) {
                delete queryParams.size
            }
            if (queryParams?.color) {
                delete queryParams.color
            }
            console.log(queryParams)
            router.push({
                ...route,
                params: {
                    ...route.params,
                },
                query: {
                    ...queryParams
                }
            });
        }
        return { filtersAll, selectedSizeFilterArray, selectedColorFilterArray, clearFilter }
    }

}



</script>

<style lang="scss" scoped>
.poc-product-filter {

    ::-webkit-scrollbar {
        width: 10px;
    }

    ::-webkit-scrollbar-thumb {
        border-radius: 30px;
        background: #b4f1f0;
        box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .25), inset -2px -2px 2px rgba(0, 0, 0, .25);
    }

    ::-webkit-scrollbar-track {
        background-color: #fff;
        border-radius: 10px;
        background: #f1f1f1;
    }

    .btn-clearall {
        padding: 12px 20px;
    }
}
</style>
  