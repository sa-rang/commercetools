<template>
    <div class="addresses">
        <div>
            <h4>Saved Address(s)</h4>
        </div>
        <div class="row">
            <div class="col-lg-4 mb-2" v-for="eachAdd in customerAddresses" :key="eachAdd.id">
                <div class="border p-2 pointer" :class="{ 'border-info': selectedAddresses == eachAdd.id }"
                    @click.prevent="selectAddress(eachAdd)">
                    <p>{{ eachAdd.firstName }} {{ eachAdd.lastName }}</p>
                    <p>{{ eachAdd.email }} </p>
                    <p>{{ eachAdd.phone }} </p>
                    <p>{{ eachAdd.streetName }}, {{ eachAdd.additionalStreetInfo }}, {{ eachAdd.city }}, {{ eachAdd.country
                    }}-{{ eachAdd.postalCode }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script >

import { onMounted, computed, shallowRef } from 'vue';


export default {
    props: {
        addressList: {
            type: Array,
            required: false,
        },
    },
    setup(props, { emit }) {
        const customerAddresses = computed(() => props.addressList);
        const selectedAddresses = shallowRef("");
        onMounted(async () => {
            //selectAddress(customerAddresses.value[0])
        });

        const selectAddress = (address) => {
            selectedAddresses.value = address.id
            emit('address-selected', {
                firstName: address?.firstName,
                additionalStreetInfo: address?.additionalStreetInfo,
                city: address?.city,
                country: address?.country,
                email: address?.email,
                lastName: address?.lastName,
                phone: address?.phone,
                postalCode: address?.postalCode,
                streetName: address?.streetName,
            });
        }

        return { customerAddresses, selectedAddresses, selectAddress }
    }
}
</script>

<style lang="scss" scoped>
.addresses {
    margin-bottom: 30px;
    margin-top: 30px;

    p {
        margin: 0;
    }

    .pointer {
        cursor: pointer;
    }
}
</style>
  