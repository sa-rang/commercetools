
<script src="./TabOrderDetail.js"></script>
<style lang="scss" src="./TabOrderDetail.scss"></style>

<template>
  <div class="myaccount-content">
    <div v-if="order">
      <h3>
        <span>{{ t('title') }}</span>
        <span v-if="order.orderNumber" data-test="details-order-number" style="margin-left: 150px;">
          {{ order.orderNumber }} ({{ order.orderState }})
        </span>
      </h3>
      <div class="row your-order-details" style="font-size: 14px;">
        <div class="col-md-3">
          {{ t('date') }}
        </div>
        <div class="col-md-3">

          <!-- @todo: base date is broken i18n does not work -->
          <BaseDate :date="order.createdAt" :format="'short'" data-test="details-order-date" />
        </div>
        <div class="col-md-5 d-flex">
          <!-- Button trigger modal -->

          <div v-if="order.orderState != 'Cancelled'">
            <div v-if="order.paymentState == 'Paid'" class="d-inline">
              <router-link :to="{ name: 'return', params: { id: order.id }, }"
                v-if="showReturnItemButton && hasItemsAbleToReturn">
                <button data-test="return-button" class="">
                  {{ t('return') }}
                </button>
              </router-link>
            </div>
            <router-link :to="'/pay?id=' + order.id + '&v=' + order.version" v-else>
              <button data-test="return-button" class="">
                Pay
              </button>
            </router-link>
          </div>
          <!-- <div v-if="order.orderState == 'Open' || order.orderState == 'Confirmed' || order.orderState == 'Cancelled'">
            <button class="ml-1" data-toggle="modal" data-target="#exampleModal">
              Modify
            </button>
          </div> -->
        </div>
      </div>
      <div class="row pt-30">
        <div class="col-md-5 address-detail">
          <b>{{ t('shippingAddress') }}</b>
          <BaseAddress class="mt-15" :address="order.shippingAddress" data-test="summary-shipping-address" />
        </div>
        <div class="col-md-1"></div>
        <div class="col-md-5 address-detail">
          <b>{{ t('billingAddress') }}</b>
          <BaseAddress class="mt-15" :address="order.billingAddress" data-test="summary-billing-address" />
        </div>
      </div>
      <div class="row pt-30">
        <div class="col-md-5 address-detail">
          <b>{{ t('shippingMethod') }}</b>
          <p class="mt-15">
            {{ order.shippingInfo?.shippingMethod?.name }}
            -
            {{
              order.shippingInfo?.shippingMethod
                ?.localizedDescription
            }}
          </p>
        </div>
        <div class="col-md-1"></div>
        <div class="col-md-5 address-detail">
          <b>{{ t('paymentDetails') }}</b>
          <p class="mt-15">Payment Reference: {{ paymentInfo.paymentId }}</p>
          <p class="mt-2">Payment Status: {{ paymentInfo.paymentStatus }}</p>
        </div>
      </div>
      <div class="mt-40">
        <b>{{ t('orderItemsTitle') }}</b>
        <CartLikeContentDetail :editable="false" :cart="order" />
      </div>
      <div v-if="order.returnInfo.length > 0" class="mt-40">
        <b>{{ t('returnedItemsTitle') }}</b>
        <CartLikeContentDetail :editable="false" :returnedItem="true" :cart="order.returnItems" />
      </div>

      <div class="offset-md-6 text-right subtotal-price">
        <div class="row">
          <span class="col-md-6 title">{{
            t('subtotal')
          }}</span>
          <span class="col-md-6 title">
            <BaseMoney :money="subtotal" data-test="order-subtotal-price" />
          </span>
        </div>
        <div class="row">
          <p class="col-md-6">{{ t('shipping') }}</p>
          <span class="col-md-6">
            <BaseMoney :money="order.shippingInfo?.price" data-test="cart-shipping-price" />
          </span>
        </div>
        <div v-if="order.discountCodes.length > 0" class="row">
          <p class="col-md-6">
            {{ t('appliedDiscounts') }}
          </p>
          <p v-for="discount in order.discountCodes" :key="discount.discountCode.id" class="col-md-6">
            {{ discount.discountCode.name }}
          </p>
        </div>
      </div>
      <div class="offset-md-6 text-right total-price">
        <div class="row">
          <span class="col-md-6 title">{{
            t('total')
          }}</span>
          <span class="col-md-6 title">
            <BaseMoney :money="order.totalPrice" data-test="cart-total-price" />
          </span>
        </div>
      </div>
      <!-- Modal -->
      <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Confirmation</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <span v-if="order.orderState == 'Cancelled'">
                Are you sure you want to modify?
              </span>
              <span v-else>
                Modification in order will cancel the current order. Are you sure you want to modify?
              </span>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" data-dismiss="modal"
                @click="modifyOrder(order.id, order.version)">Modify Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pt-50 pb-55" v-if="!loading && !order">
      <h1 class="text-center">{{ t('notFound') }}</h1>
    </div>

  </div>
</template>
