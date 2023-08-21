<template>
    <div>
        <div class="payment-page">
            <div class="container">
                <div class="payment-container">
                    <div class="payment" ref="payElementRef"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script >
import { ref, onMounted, computed } from 'vue';
import useCurrency from 'hooks/useCurrency';

import '@adyen/adyen-web/dist/adyen.css';
let AdyenCheckout;
AdyenCheckout = require("@adyen/adyen-web");

export default {
    props: {
        amount: {
            type: Object,
            required: true,
        },
    },
    setup(props, { emit }) {
        const sessionId = ref("");
        const redirectResult = ref("");
        const pspRef = ref("");
        const payType = "dropin";
        const payElementRef = ref(null);
        const payMethodData = ref(null);
        const cartAmount = computed(() => props.amount);
        const currency = useCurrency();


        onMounted(async () => {
            const urlParams = new URLSearchParams(window.location.search);
            sessionId.value = urlParams.get('sessionId');
            redirectResult.value = urlParams.get('redirectResult');

            if (sessionId.value) {
                // found session: finalize checkout
                await finalizeCheckout();
            } else {
                // no session: init checkout
                await startCheckout();
            }
        });



        const startCheckout = async () => {
            try {
                // Initiate Sessions
                const { response, clientKey } = await callServer(
                    "/api/sessions?type=" + payType,
                    {
                        amount: cartAmount.value.centAmount,
                        currency: currency.value
                    }
                );
                // Create AdyenCheckout using Sessions response
                const checkout = await createAdyenCheckout(response, clientKey);

                // Create an instance of Drop-in and mount it
                checkout.create(payType).mount(payElementRef.value);

            } catch (error) {
                console.error(error);
                alert("Error occurred. Look at console for details");
            }
        }

        const finalizeCheckout = async () => {
            try {
                // Create AdyenCheckout re-using existing Session
                const checkout = await createAdyenCheckout({ id: sessionId.value });

                // Submit the extracted redirectResult (to trigger onPaymentCompleted() handler)
                checkout.submitDetails({ details: redirectResult.value });

            } catch (error) {
                console.error(error);
                alert("Error occurred. Look at console for details");
            }
        }

        const createAdyenCheckout = async (session, clientKey) => {
            pspRef.value = session.reference;
            const configuration = {
                clientKey: clientKey,
                locale: "en_US",
                environment: "test", // change to live for production
                showPayButton: true,
                session: session,
                paymentMethodsConfiguration: {
                    ideal: {
                        showImage: true
                    },
                    card: {
                        hasHolderName: true,
                        holderNameRequired: true,
                        name: "Credit or debit card",
                        amount: {
                            value: session.amount.value,
                            currency: session.amount.currency
                        }
                    },
                    paypal: {
                        amount: {
                            currency: session.amount.currency,
                            value: session.amount.value
                        },
                        environment: "test",
                        countryCode: "US"   // Only needed for test. This will be automatically retrieved when you are in production.
                    }
                },
                beforeSubmit: async (data, component, actions) => {
                    payMethodData.value = data;
                    actions.resolve(data);
                },
                onPaymentCompleted: (result, component) => {
                    handleServerResponse(result, component);
                },
                onError: (error, component) => {
                    console.error(error.name, error.message, error.stack, component);
                }
            };

            return new AdyenCheckout(configuration);
        }

        const callServer = async (url, data) => {
            const res = await fetch(url, {
                method: "POST",
                body: data ? JSON.stringify(data) : "",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return await res.json();
        }

        const handleServerResponse = async (res, component) => {
            if (res.action) {
                component.handleAction(res.action);
            } else {
                if (res.resultCode) {
                    let payMethod = payMethodData.value?.paymentMethod?.type == "scheme" ? "card" : payMethodData.value?.paymentMethod?.type;
                    emit('payment-status',
                        {
                            resultCode: res.resultCode,
                            centAmount: cartAmount.value.centAmount,
                            paymentRef: pspRef.value,
                            payMethod: payMethod
                        });
                }
                // switch (res.resultCode) {
                //     case "Authorised":
                //         emit('payment-status', { resultCode: res.resultCode, paymentRef: pspRef.value ,payMethod:payMethodData.value?.paymentMethod?.type});
                //         //window.location.href = "/result/success";
                //         break;
                //     case "Pending":
                //     case "Received":
                //         //window.location.href = "/result/pending";
                //         emit('payment-status', { resultCode: res.resultCode, paymentRef: pspRef.value });
                //         break;
                //     case "Refused":
                //         //window.location.href = "/result/failed";
                //         emit('payment-status', { resultCode: res.resultCode, paymentRef: pspRef.value });
                //         break;
                //     default:
                //         // window.location.href = "/result/error";
                //         emit('payment-status', { resultCode: res.resultCode, paymentRef: pspRef.value });
                //         break;
                // }
            }
        }




        return { payElementRef }
    }

}



</script>

<style lang="scss" >
.payment-page {
    margin-top: 20px;

    .container {
        padding: 0;
    }

    .adyen-checkout__status {
        height: 150px;
    }

    .adyen-checkout__payment-method {
        border-radius: 0;
    }

    .adyen-checkout__payment-method:first-child {
        border-radius: 0;
    }

    .adyen-checkout__payment-method:last-child {
        border-radius: 0;
    }

    .adyen-checkout__payment-method--selected {
        background: #f9f9f9;
        border-radius: 0;
    }

    .adyen-checkout__input {
        border-radius: 0;
    }

    .adyen-checkout__button {
        border-radius: 0;
    }
}
</style>
  