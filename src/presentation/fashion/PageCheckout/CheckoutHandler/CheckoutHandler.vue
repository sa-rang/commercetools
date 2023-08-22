<template>
    <div>
        <div class="checkout-hanlder">
            <div class="container">
                <div class="row" v-if="loadPaymentInterface">
                    <div class="col-lg-6 offset-lg-3 ">
                        <Payment v-if="!loading && order.totalPrice" :amount="order.totalPrice"
                            @payment-status="paymentStatusAndPlaceOrder" />

                    </div>
                </div>
                <div class="row" v-if="orderTransMsg">
                    <div class="col-lg-6 offset-lg-3">
                        <h3>{{ orderTransMsg }}</h3>
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
import { useRoute, useRouter } from 'vue-router';
import useMyOrderBasic from 'hooks/ct/useMyOrder';
import useLocale from 'hooks/useLocale';

export default {
    components: {
        Payment
    },

    setup() {
        const cartTools = useCartTools();
        const route = useRoute();
        const router = useRouter();
        const orderTransMsg = shallowRef(null);
        const loadPaymentInterface = shallowRef(false);

        const { locale } = useLocale();
        const { loading, order } = useMyOrderBasic({
            locale,
            id: route.query.id,
        });
        watch(order, (iOrder) => {
            if (iOrder?.paymentState == "Paid") {
                gotoThankYou(iOrder?.orderNumber)
            } else {
                loadPaymentInterface.value = true
            }
        });
        onMounted(async () => {
        });

        const paymentStatusAndPlaceOrder = async (iPayData) => {
            //take payment status and data and create order resultCode
            // switch (iPayData.resultCode) {
            //     case "Authorised":


            //         //window.location.href = "/result/success";
            //         break;
            //     case "Pending":
            //     case "Received":

            //         //window.location.href = "/result/pending";

            //         break;
            //     case "Refused":

            //         //window.location.href = "/result/failed";

            //         break;
            //     default:

            //         // window.location.href = "/result/error";
            //         break;
            // }

            cartTools.createPaymentAndUpdateOrder({
                method: iPayData.payMethod,
                payId: iPayData.paymentRef,
                payStatus: iPayData.resultCode,
                centAmount: iPayData.centAmount,
                orderId: route.query.id,
                orderVersion: parseInt(route.query.v),

            }).then(({ data }) => {
                let orderData = data?.updateOrder
                if (orderData && orderData?.orderNumber && orderData?.orderState == "Confirmed") {
                    gotoThankYou(data?.updateOrder?.orderNumber)
                } else {
                    orderTransMsg.value = "Order not confirmed!"
                }
            }).catch((error) => console.warn('error:', error));
        }

        const gotoThankYou = (orderNumber) => {
            router.push({
                name: 'thankyou',
                query: {
                    id: orderNumber
                }
            });
        }
        return { loading, order, orderTransMsg, loadPaymentInterface, paymentStatusAndPlaceOrder }
    }
}
</script>

<style lang="scss" scoped>
.checkout-hanlder {
    margin-top: 50px;
    margin-bottom: 100px;
    min-height: 300px;
}
</style>
  