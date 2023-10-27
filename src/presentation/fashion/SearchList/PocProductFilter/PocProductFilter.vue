<template>
    <div>
        <div class="poc-product-filte">
            {{ selectedFilterArray }}
            <div v-for="eachFilter in filtersAll" :key="eachFilter.filter">
                <div>{{ eachFilter.filter }}</div>
                <div v-for="eachValue, index in eachFilter.values" :key="index">
                    <input class="check mr-2" :value="eachValue.term" v-model="selectedFilterArray" @click="toggelFilter"
                        type="checkbox" />
                    <span>
                        {{ eachValue.term }}
                        <span class="font-italic font-weight-lighter ml-1">({{ eachValue.count }})</span>
                    </span>
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
        const selectedFilterArray = ref([])
        const filtersAll = computed(() => {
            let filt = [];
            let keys = Object.keys(props.filters);
            keys.map((eachKey) => {
                if (eachKey == "variants.attributes.colors") {
                    let facetObj = props.filters["variants.attributes.colors"]
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

        watch(selectedFilterArray, (set) => {
            if (set) {
                let SizeValue = set.join(",")
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

        const toggelFilter = () => {


        }
        return { filtersAll, selectedFilterArray, toggelFilter }
    }

}



</script>

<style lang="scss" >
.poc-product-filter {}
</style>
  