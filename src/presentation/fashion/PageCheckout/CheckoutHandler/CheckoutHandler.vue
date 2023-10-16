<template>
    <div>
        <div class="checkout-hanlder">
            <div class="container">
                <div class="row" v-if="loadPaymentInterface">

                    <div v-if="getUserPayTokens && getUserPayTokens.length > 0" class="col-lg-6 offset-lg-3 ">
                        <div class="border p-3">
                            <h3>Use saved authorization</h3>
                            <div v-for="(eachToken, index) in getUserPayTokens" :key="index">
                                <p>User Ref: {{ eachToken.shopperReference }}</p>
                                <p>Payment method: {{ eachToken.paymentMethod }}</p>
                                <button @click="initiateReccuringPayment(eachToken.recurringDetailReference)">Pay</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6 offset-lg-3 ">
                        <Payment v-if="!loading && order.totalPrice" :amount="order.totalPrice"
                            :ordernumber="order.orderNumber" @payment-status="addPaymentOnOrder" />
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
import useCustomerTools from 'hooks/useCustomerTools';

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
        const getUserPayTokens = shallowRef(null);
        const { customer, refreshUser } = useCustomerTools();

        const { locale } = useLocale();
        const { loading, order } = useMyOrderBasic({
            locale,
            id: route.query.id,
        });
        watch(order, async (iOrder) => {
            if (iOrder?.paymentState == "Paid") {
                gotoThankYou(iOrder?.orderNumber)
            } else {
                await refreshUser()
                getUserPayTokens.value = await getUserPaymentTokens()
                loadPaymentInterface.value = true
            }
        });
        onMounted(async () => {
        });

        const addPaymentOnOrder = async (iPayData) => {

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

        const gotoThankYou = async (orderNumber) => {
            //send order comfirm mail here
            await sendMail();
            router.push({
                name: 'thankyou',
                query: {
                    id: orderNumber
                }
            });
        }

        const sendMail = async () => {
            let mailData = {
                type: "OrderPlace",
                orderDetails: order?.value,
                customerEmail: customer.value?.email || "",
                customerName: (customer.value?.firstName + " " + customer.value?.lastName)
            }
            const res = await fetch("/api/sendmail", {
                method: "POST",
                body: mailData ? JSON.stringify(mailData) : "",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return await res.json();
        }

        const getUserPaymentTokens = async () => {
            try {
                let tokens = [];
                if (customer.value?.custom?.customFieldsRaw && customer.value?.custom?.customFieldsRaw.length > 0) {
                    let rawFields = customer.value?.custom?.customFieldsRaw;
                    let PayRef = rawFields.find(o => o.name === 'pspAuthorizationCode');
                    if (PayRef) {
                        let splitValue = PayRef.value.split("**");
                        if (splitValue && splitValue.length == 3) {
                            tokens.push({
                                shopperReference: splitValue[2],
                                paymentMethod: splitValue[1],
                                recurringDetailReference: splitValue[0]
                            })
                        }
                    }
                }
                return tokens;
            } catch (error) {
                console.error(error);
                alert("Error occurred. Look at console for details");
            }
        }

        const initiateReccuringPayment = async (iPayRef) => {

            try {

                // setup recurring data
                let url = "/api/recpayment";
                let data = {
                    amount: order.value?.totalPrice.centAmount,
                    currency: order.value?.totalPrice.currencyCode,
                    orderNumber: order.value?.orderNumber,
                    customerRef: customer.value?.email || "",
                    recReference: iPayRef
                }

                // initiate recurring payment
                const res = await fetch(url, {
                    method: "POST",
                    body: data ? JSON.stringify(data) : "",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const { response } = await res.json();
                // set payment data on order
                let payRes = {
                    payMethod: response?.paymentMethod?.type == "scheme" ? "card" : response?.paymentMethod?.type,
                    paymentRef: response.pspReference,
                    resultCode: response.resultCode,
                    centAmount: response.amount.value,
                }
                await addPaymentOnOrder(payRes);
            } catch (error) {
                console.error(error);
                alert("Error occurred. Look at console for details");
            }
        }

        return { loading, order, orderTransMsg, loadPaymentInterface, getUserPayTokens, addPaymentOnOrder, initiateReccuringPayment }
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
  