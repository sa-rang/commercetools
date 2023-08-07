import { useI18n } from 'vue-i18n';
import translations from "./CartDetail.json"
import Spinner from 'presentation/components/Spinner/Spinner.vue';
import CartLikeContentDetail from './CartLikeContentDetail/CartLikeContentDetail.vue';
import AddDiscountCodeForm from './AddDiscountCodeForm/AddDiscountCodeForm.vue';
import CartLikePriceDetail from './CartLikePriceDetail/CartLikePriceDetail.vue';
import useCartTools from 'hooks/useCartTools';
import useCart from 'hooks/useCart';

// import AddDiscountCodeForm from '../AddDiscountCodeForm/AddDiscountCodeForm.vue';
export default {
  name: 'CartDetail',
  components: {
    Spinner,
    CartLikeContentDetail,
    AddDiscountCodeForm,
    CartLikePriceDetail,
  },
  setup() {
    const { t } = useI18n({
      messages: translations
    });
    const { cart, loading, error } = useCart();
    return {
      t,
      cart,
      loading,
      error,
      ...useCartTools(),
    };
  },
};
