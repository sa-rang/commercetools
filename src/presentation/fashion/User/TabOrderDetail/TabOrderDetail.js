import BaseMoney from 'presentation/components/BaseMoney/BaseMoney.vue';
import BaseDate from 'presentation/components/BaseDate/BaseDate.vue';
import LineItemInfo from 'presentation/CartDetail/CartLikeContentDetail/LineItemInfo/LineItemInfo.vue';
import CartLikeContentDetail from 'presentation/CartDetail/CartLikeContentDetail/CartLikeContentDetail.vue';
import BaseAddress from 'presentation/components/BaseAddress/BaseAddress.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import translation from './TabOrderDetail.json'
import useCustomerTools from 'hooks/useCustomerTools';
import useAccessRules from 'hooks/useAccessRules';
import useCartTools from 'hooks/useCartTools';
import { useRouter } from 'vue-router';

export default {
  components: {
    CartLikeContentDetail,
    BaseDate,
    BaseMoney,
    BaseAddress,
    LineItemInfo,
  },

  computed: {
    hasItemsAbleToReturn() {
      return this.order.lineItems.length > 0 ? true : false;
    },
  },
  props: {},
  setup() {
    const { showReturnItemButton } = useAccessRules();
    const tools = useCustomerTools();
    const { t } = useI18n({
      messages: translation
    });
    const { loading, order } = tools.useMyOrder();
    const subtotal = computed(() => {
      //@todo: is this not already done in cart tools?
      if (order.value) {
        const { currencyCode, fractionDigits } =
          order.value.totalPrice;
        return {
          centAmount: order.value.lineItems.reduce(
            (acc, li) => acc + li.totalPrice.centAmount,
            0
          ),
          currencyCode,
          fractionDigits,
        };
      }
      return null;
    });
    // const paymentInfo = computed(() => {
    //   return order.value?.paymentInfo?.payments?.[0]
    //     ?.paymentStatus?.interfaceCode
    //     ? t(
    //       order.value?.paymentInfo?.payments?.[0]
    //         ?.paymentStatus?.interfaceCode
    //     )
    //     : '';
    // });

    const paymentInfo = computed(() => {
      return {
        paymentId: order.value?.paymentInfo?.paymentRefs?.[0]?.id,
        paymentStatus: order.value?.paymentState,
      }
    });

    const cartTools = useCartTools();
    const router = useRouter();


    const modifyOrder = (iOderId, iOderVersion) => {
      return Promise.resolve()
        .then(() => {
          if (order.value.orderState == 'Cancelled') return
          return cartTools.setOrderStatusCancelled({ orderId: iOderId, orderVersion: iOderVersion })
        })
        .then(() => {
          return cartTools.replicateCart({ orderId: iOderId })
        }).then(({ id }) => {
          console.log("ok", id)
          if (id) {
            router.push({
              name: 'cart'
            });
          }
        }).catch((err) => console.warn('error:', err))



    }

    return {
      t,
      subtotal,
      paymentInfo,
      order,
      loading,
      showReturnItemButton,
      modifyOrder
    };
  },
};
