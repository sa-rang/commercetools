<template>
    <div class="addresses">
        <div v-if="customerAddresses.length > 0">
            <div>
                <h4>Saved Address(s)</h4>
            </div>
            <div class="row">
                <div class="col-lg-4 mb-2" v-for="eachAdd in customerAddresses" :key="eachAdd.id">
                    <div class="border p-2 ">
                        <p>{{ eachAdd.firstName }} {{ eachAdd.lastName }}</p>
                        <p>{{ eachAdd.email }} </p>
                        <p>{{ eachAdd.phone }} </p>
                        <p>{{ eachAdd.streetName }}, {{ eachAdd.additionalStreetInfo }}, {{ eachAdd.city }}, {{
                            eachAdd.country
                        }}-{{ eachAdd.postalCode }}</p>
                        <div>
                            <i class="las la-pen p-1 mr-2 pointer border" @click.prevent="editAddress(eachAdd)"></i>
                            <i class="las la-trash p-1 pointer border" @click.prevent="deleteAddress(eachAdd)"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <h5>No Saved Address</h5>
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

        const editAddress = (address) => {
            //selectedAddresses.value = address.id
            emit('address-edit', {
                id: address.id,
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

        const deleteAddress = (address) => {
            //selectedAddresses.value = address.id
            emit('address-delete', { id: address.id });
        }

        return { customerAddresses, selectedAddresses, editAddress, deleteAddress }
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
  