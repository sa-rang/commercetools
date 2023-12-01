
<template>
  <div class="tab-manage-address">
    <h3>Manage Address</h3>
    <AddressDetails v-if="!isEdit" :addressList="customerAddresses" @address-edit="editAddress"
      @address-delete="deleteAddress" />
    <div v-else>
      <BaseAddressForm @update-address="updateBillingAddress" @valid-form="validBillingForm" :address="selectedAddress" />
      <button class="mr-3" @click.prevent="updateAddress()">Update</button>
      <button @click.prevent="isEdit = false">Cancel</button>
      <div v-if="showError" class="error-message mt-10">
        * Please fill in all required data
      </div>
      <ServerError :error="error" class="server-error">{{ 'unknownError' }}</ServerError>
    </div>

  </div>
</template>

<script>
import { computed, shallowRef, onMounted } from 'vue';

import BaseAddressForm from '../../PageCheckout/BillingDetails/BaseAddressForm/BaseAddressForm.vue';
import AddressDetails from "./AddressDetails/AddressDetails.vue"
import ServerError from 'presentation/components/ServerError/ServerError.vue';
import useCustomerTools from 'hooks/useCustomerTools';
export default {
  components: {
    BaseAddressForm,
    AddressDetails,
    ServerError
  },
  setup() {
    const billingAddress = shallowRef({});
    const differentAddress = shallowRef(false);
    const newBillingAddress = shallowRef(null);
    const customerAddresses = shallowRef([])
    const isEdit = shallowRef(false)
    const selectedAddress = shallowRef({})
    const { customer, refreshUser, updateUserAddress, deleteUserAddress } = useCustomerTools();
    const validForm = shallowRef(null)
    const showError = shallowRef(false);
    const error = shallowRef(null);

    onMounted(async () => {
      await refreshUserData()
    });
    const refreshUserData = async () => {
      await refreshUser()
      customerAddresses.value = customer.value?.addresses;
    }

    const billingToJSON = computed(() => {
      return JSON.stringify(newBillingAddress.value);
    });
    const unsetBillingAddress = () => {
      return (newBillingAddress.value = null);
    };
    const updateBillingAddress = (address) => {
      newBillingAddress.value = address;
    };

    const validBillingForm = (valid) => {
      // emit('valid-billing-form', valid);
      validForm.value = valid
      console.log(valid)
    };

    const editAddress = (address) => {
      selectedAddress.value = address
      validForm.value = true
      isEdit.value = true
    }
    const deleteAddress = (address) => {
      console.log(address)
      if (confirm("Do you really want to delete?")) {
        return deleteUserAddress(address)
          .then(({ data }) => {
            console.log("deleted", data)
            showError.value = false;
            refreshUserData()
          })
          .catch((e) => {
            error.value = e;
          });
      }
    }

    const updateAddress = () => {
      if (!validForm.value) {
        showError.value = true;
        return Promise.resolve();
      }
      let addressData = {
        id: selectedAddress.value?.id,
        firstName: selectedAddress.value?.firstName,
        additionalStreetInfo: selectedAddress.value?.additionalStreetInfo,
        city: selectedAddress.value?.city,
        country: selectedAddress.value?.country,
        email: selectedAddress.value?.email,
        lastName: selectedAddress.value?.lastName,
        phone: selectedAddress.value?.phone,
        postalCode: selectedAddress.value?.postalCode,
        streetName: selectedAddress.value?.streetName,
      }

      return updateUserAddress(addressData)
        .then(({ data }) => {
          console.log("upadated", data)
          showError.value = false;
          console.log(validForm.value)
          isEdit.value = false
          refreshUserData()
        })
        .catch((e) => {
          error.value = e;
        });
    }


    return {
      billingAddress,
      billingToJSON,
      differentAddress,
      newBillingAddress,
      unsetBillingAddress,
      updateBillingAddress,
      validBillingForm,
      customerAddresses,
      updateAddress,
      editAddress,
      selectedAddress,
      deleteAddress,
      isEdit,
      validForm,
      showError,
      error

    };
  },
};
</script>

<style lang="scss" >
.tab-manage-address {
  .billing-info {
    label {
      display: block;
      margin: 0 0 10px;
      color: #262626;

      abbr {
        color: red;
        text-decoration: none;
      }
    }

    input {
      border: 1px solid #e8e8e8;
      height: 50px;
      background-color: transparent;
      padding: 2px 20px;
      color: #777;

      &:focus {
        border: 1px solid #262626;
      }

      &.billing-address {
        margin-bottom: 20px;
      }
    }
  }

  .error-message {
    color: red;
  }
}
</style>
