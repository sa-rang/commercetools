import BaseMoney from 'presentation/components/BaseMoney/BaseMoney.vue';
import BaseDate from 'presentation/components/BaseDate/BaseDate.vue';
import Spinner from 'presentation/components/Spinner/Spinner.vue';
import Pagination from 'presentation/components/Pagination/Pagination.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import translation from './TabOrderList.json'
import useCustomerTools from 'hooks/useCustomerTools';

export default {
  components: {
    BaseMoney,
    BaseDate,
    Spinner,
    Pagination,
  },
  setup() {
    const tools = useCustomerTools();
    const { setPage, loading, orders, total, page } =
      tools.useMyOrders();
    const { t } = useI18n({
      messages: translation
    });
    const orderListNotEmpty = computed(() => {
      return Boolean(orders.value.length);
    });

    function translateStatus(state) {
      return state ? t(state) : '-';
    }
    // function paymentInfo(order) {
    //   return order?.paymentInfo?.payments?.[0]
    //     ?.paymentStatus?.interfaceCode
    //     ? t(
    //       order?.paymentInfo?.payments?.[0]?.paymentStatus
    //         ?.interfaceCode
    //     )
    //     : '';
    // }

    const paymentInfo = (order) => {
      return order?.paymentState ? t(order?.paymentState) : "Pending"
    }

    return {
      t,
      loading,
      page,
      orders,
      orderListNotEmpty,
      total,
      translateStatus,
      paymentInfo,
      setPage,
    };
  },
};
