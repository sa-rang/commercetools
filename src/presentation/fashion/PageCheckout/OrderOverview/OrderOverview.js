// @todo: add scrollbar
// import VuePerfectScrollbar from "vue-perfect-scrollbar";
import Payment from 'presentation/PageCheckout/Payment/Payment.vue';
import PaymentMethod from './PaymentMethod/PaymentMethod.vue';
import BasePrice from 'presentation/components/BasePrice/BasePrice.vue';
import { useI18n } from 'vue-i18n';
import translation from "./OrderOverview.json"
import ShippingMethod from './ShippingMethod/ShippingMethod.vue';
import { ref } from 'vue';
import useCartTools from 'hooks/useCartTools';

export default {
  props: {
    showError: {
      type: Boolean,
      required: false,
    },
    cart: {
      type: Object,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  components: {
    ShippingMethod,
    BasePrice,
    PaymentMethod,
    Payment
    // VuePerfectScrollbar,
  },
  setup(props, { emit }) {
    const { t } = useI18n({
      messages: translation
    });
    const paid = ref(false);
    const paymentId = ref(null);
    const paymentMethod = ref(null);
    const cardPaid = (paymentId) => {
      if (paymentId) {
        paymentId.value = paymentId;
      }
      paid.value = true;
    };
    const updateShippingMethod = (shippingId) => {
      emit('update-shipping', shippingId);
    };
    const placeOrder = () => {
      emit('complete-order', { payId: paymentId.value, payMethod: paymentMethod.value });
      //emit('complete-order', { payId: "test ref", payMethod: "test card" });
    };
    const paymentChanged = (value) =>
      emit('payment-changed', value);

    const paymentStatus = (idata) => {
      console.log(idata)
      //if (idata?.resultCode == "Authorised") {
      paid.value = true;
      paymentId.value = idata.paymentRef;
      paymentMethod.value = idata.payMethod;

      //}
    }



    return {
      ...useCartTools(),
      t,
      cardPaid,
      updateShippingMethod,
      paymentId,
      paid,
      paymentMethod: props.paymentMethod,
      paymentChanged,
      placeOrder,
      paymentStatus
    };
  },
};
