import { shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import translation from './Pay.json'
import { useRoute } from 'vue-router';
import useCart from 'hooks/composition/useCart';
import useCartTools from 'hooks/composition/useCartTools';

export default {
  // props: {
  //   payid: {
  //     type: String,
  //     required: true,
  //   },
  //   paymethod: {
  //     type: String,
  //     required: true,
  //   }
  // },
  setup() {
    const { t } = useI18n({
      messages: translation
    });
    const orderComplete = shallowRef(false);
    const route = useRoute();
    const { cart } = useCart();
    const cartTools = useCartTools();
    const saved = shallowRef(false);
    // const paymentRef = shallowRef(props.payid);
    // const paymentMethod = shallowRef(props.paymethod);

    watch([cart, saved], ([cart, s]) => {
      if (cart && !s) {
        saved.value = true;
        console.log("routpara", route.params)
        cartTools
          .createMyOrderFromCart({
            method: route.params.method,
            payId: route.params.payid,
            cart,
          })
          .then(() => {
            orderComplete.value = true;
          })
          .catch((error) => console.warn('error:', error));
      }
    });

    return { t, orderComplete };
  },
};
