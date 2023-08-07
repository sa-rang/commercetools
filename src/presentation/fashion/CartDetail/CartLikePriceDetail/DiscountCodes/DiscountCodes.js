import { useI18n } from 'vue-i18n';
import transaltion from './DiscountCodes.json'
import RemoveDiscountCodeForm from './RemoveDiscountCodeForm/RemoveDiscountCodeForm.vue';

export default {
  components: { RemoveDiscountCodeForm },
  props: {
    cart: {
      type: Object,
      required: true,
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { t } = useI18n({
      messages: transaltion
    });
    return { t };
  },
};
