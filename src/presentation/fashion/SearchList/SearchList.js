// import ProductFilter from '../ProductFilter/ProductFilter.vue';
// import TopBar from '../TopBar/TopBar.vue';
import Pagination from 'presentation/components/Pagination/Pagination.vue';
import Spinner from 'presentation/components/Spinner/Spinner.vue';
import ProductThumbnail from './ProductThumbnail/ProductThumbnail.vue';
import { useI18n } from 'vue-i18n';
import transaltion from './SearchList.json'
import useProductTools from 'hooks/useProductTools';
import useCartTools from 'hooks/useCartTools';

export default {
  name: 'SearchList',
  components: {
    Spinner,
    ProductThumbnail,
    Pagination,
    // ProductFilter,
    // TopBar,
  },
  setup() {
    const { t } = useI18n({
      messages: transaltion
    });
    const { addLine } = useCartTools();
    const {
      formatProduct,
      products,
      total,
      loading,
      page,
      error,
      setPage,
    } = useProductTools();

    const addToCart = (sku, quantity = 1) =>
      addLine(sku, quantity);

    return {
      t,
      formatProduct,
      products,
      total,
      loading,
      page,
      setPage,
      error,
      addToCart,
    };
  },
};
