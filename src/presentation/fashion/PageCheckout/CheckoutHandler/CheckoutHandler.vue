<template>
    <div>
        <div class="checkout-hanlder">
            <div class="container">
                <div class="row" v-if="!orderComplete">
                    <div class="col-lg-6 offset-lg-3 ">
                        <Payment v-if="!loading && order.totalPrice" :amount="order.totalPrice"
                            @payment-status="paymentStatusAndPlaceOrder" />

                    </div>
                </div>
                <div class="row" v-else>
                    <div v-if="paymentStatus == 1" class="col-lg-6 offset-lg-3 mt-50 text-center">
                        <h2>Thank You</h2>
                        <p>Your order <b>{{ orderData.orderNumber }}</b> has been placed successfully.</p>
                        <router-link class=" btn-grey mt-50" to="/">
                            Continue Shopping
                        </router-link>
                    </div>
                    <div v-else class="col-lg-6 offset-lg-3">
                        <h2>Error in Payment </h2>
                        <!-- <p>But your order has been placed successfully. Please do payment retry.</p>
                            <router-link class="mt-50" to="/">
                                Continue Shopping
                            </router-link> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script >
import Payment from 'presentation/PageCheckout/Payment/Payment.vue';
import { onMounted, shallowRef, watch } from 'vue';
import useCartTools from 'hooks/useCartTools';
import { useRoute } from 'vue-router';
import useMyOrderBasic from 'hooks/ct/useMyOrder';
import useLocale from 'hooks/useLocale';

export default {
    components: {
        Payment
    },

    setup() {
        const orderComplete = shallowRef(false);
        const orderData = shallowRef(null)
        const paymentStatus = shallowRef(false);
        const cartTools = useCartTools();
        const route = useRoute();

        const { locale } = useLocale();
        const { loading, order } = useMyOrderBasic({
            locale,
            id: route.query.id,
        });
        watch(order, (iOrder) => {
            if (iOrder?.paymentState == "Paid") {
                orderData.value = iOrder
                orderComplete.value = true
                paymentStatus.value = 1

            }
        });
        onMounted(async () => {
        });

        const paymentStatusAndPlaceOrder = async (iPayData) => {
            //take payment status and data and create order resultCode
            console.log("AdyenPay", iPayData)

            switch (iPayData.resultCode) {
                case "Authorised":
                    paymentStatus.value = 1

                    //window.location.href = "/result/success";
                    break;
                case "Pending":
                case "Received":
                    paymentStatus.value = 2
                    //window.location.href = "/result/pending";

                    break;
                case "Refused":
                    paymentStatus.value = 3
                    //window.location.href = "/result/failed";

                    break;
                default:
                    paymentStatus.value = 4
                    // window.location.href = "/result/error";
                    break;
            }

            cartTools.createPaymentAndUpdateOrder({
                method: iPayData.payMethod,
                payId: iPayData.paymentRef,
                payStatus: iPayData.resultCode,
                centAmount: iPayData.centAmount,
                orderId: route.query.id,
                orderVersion: parseInt(route.query.v),

            }).then(({ data }) => {
                orderData.value = data?.updateOrder
                orderComplete.value = true;
            }).catch((error) => console.warn('error:', error));
        }
        return { orderComplete, orderData, paymentStatus, loading, order, paymentStatusAndPlaceOrder }
    }
}
</script>

<style lang="scss" scoped>
.checkout-hanlder {
    margin-top: 50px;
    margin-bottom: 100px;
    min-height: 550px;
}
</style>
  