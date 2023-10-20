
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';



function useSearchTools() {
  const route = useRoute();
  const router = useRouter();
  //const sku = computed(() => route.params.sku);
  // const { products, total, loading, error, categoryError } =
  //   useProducts({
  //     sku,
  //     expand: expand ? { variants: true } : {},
  //   });

  const searchProducts = async () => {
    let param = {
      search: route?.query?.q || '',
      offset: route.params.page ? route.params.page * 10 : 0
    }
    const res = await fetch(`api/productsearch`, {
      method: "POST",
      body: JSON.stringify(param),
      headers: {
        "Content-Type": "application/json",
      },

    });
    let searchResults = await res.json();
    console.log("pp", searchResults)
    return { results: searchResults.productProjectionSearch.results, total: searchResults.productProjectionSearch.total }
  }

  const setPage = (page) =>
    router.push({
      ...route,
      params: {
        ...route.params,
        page,
      },
    });
  const page = computed(() =>
    Number(route.params.page || 1)
  );
  const formatProduct = (product) => ({
    ...product,
    ...product.masterVariant,
  });

  return {
    searchProducts,
    setPage,
    formatProduct,
    page,
  };
}
export default useSearchTools;
