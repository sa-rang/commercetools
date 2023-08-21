// @todo: add scrollbar
// import VuePerfectScrollbar from "vue-perfect-scrollbar";
import Payment from 'presentation/PageCheckout/Payment/Payment.vue';
import PaymentMethod from './PaymentMethod/PaymentMethod.vue';
import BasePrice from 'presentation/components/BasePrice/BasePrice.vue';
import { useI18n } from 'vue-i18n';
import translation from "./OrderOverview.json"
import ShippingMethod from './ShippingMethod/ShippingMethod.vue';
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

    const updateShippingMethod = (shippingId) => {
      emit('update-shipping', shippingId);
    };
    const placeOrder = () => {
      emit('complete-order');
      //emit('complete-order', { payId: "test ref", payMethod: "test card" });
    };
    const paymentChanged = (value) =>
      emit('payment-changed', value);

    return {
      ...useCartTools(),
      t,
      updateShippingMethod,
      paymentChanged,
      placeOrder,
    };
  },
};
