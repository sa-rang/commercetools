// import ProductFilter from '../ProductFilter/ProductFilter.vue';
// import TopBar from '../TopBar/TopBar.vue';
import Pagination from 'presentation/components/Pagination/Pagination.vue';
import Spinner from 'presentation/components/Spinner/Spinner.vue';
import ProductThumbnail from './ProductThumbnail/ProductThumbnail.vue';
import { useI18n } from 'vue-i18n';
import transaltion from './SearchList.json'
import useSearchTools from 'hooks/useSearchTools';
import useCartTools from 'hooks/useCartTools';
import { onMounted, shallowRef, watch } from 'vue';
import { useRoute } from "vue-router";

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
    const route = useRoute();
    const { addLine } = useCartTools();
    const {
      formatProduct,
      searchProducts,
      page,
      setPage,
    } = useSearchTools();
    const products = shallowRef([])
    const total = shallowRef(0)
    onMounted(async () => {
      let searchResult = await searchProducts();
      products.value = searchResult.results;
      total.value = searchResult.total;
    });

    watch(
      () => route.fullPath,
      async () => {
        let searchResult = await searchProducts();
        products.value = searchResult.results;
        total.value = searchResult.total;
      }
    );

    const addToCart = (sku, quantity = 1) =>
      addLine(sku, quantity);

    return {
      t,
      formatProduct,
      products,
      total,
      page,
      setPage,
      addToCart,
    };
  },
};
