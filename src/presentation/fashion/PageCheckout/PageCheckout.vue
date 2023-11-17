<style src="./PageCheckout.scss" lang="scss"></style>
<script src="./PageCheckout.js"></script>

<template>
  <span>
    <div v-if="cartNotEmpty(cart)" class="checkout-main-area pt-130 pb-100">
      <div class="container">
        <div class="checkout-wrap">
          <div class="row">
            <div class="col-lg-7">
              <h3 class="heading-checkout">Billing Details</h3>
              <div v-if="customerAddresses.length > 0">
                <AddressDetails :addressList="customerAddresses" @address-selected="addressSelected"
                  v-if="billingAddressType == 'address'" />
                <button @click.prevent="setBillingAddressType('form')" v-if="billingAddressType == 'address'">Add new
                  address</button>
                <button @click.prevent="setBillingAddressType('address')" v-if="billingAddressType == 'form'">Select from
                  saved
                  address</button>
              </div>
              <BillingDetails v-if="billingAddressType == 'form'" :billingAddress="billingAddress"
                :shippingAddress="shippingAddress" @update-billing-details="updateBilling"
                @update-shipping-details="updateShipping" @valid-billing-form="setValidBillingForm"
                @valid-shipping-form="setValidShippingForm" @save-address-toggle="saveAddressToggle" />
            </div>
            <div class="col-lg-5">
              <OrderOverview @update-shipping="updateShippingMethod" @complete-order="placeOrder"
                @payment-changed="paymentChanged" :paymentMethod="paymentMethod" :showError="showError" :cart="cart" />
              <ServerError :error="error" class="server-error">{{ 'unknownError' }}</ServerError>
            </div>
          </div>
        </div>
      </div>
    </div>
  </span>
</template>
