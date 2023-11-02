
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ALL } from '../src/constants';



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
      offset: route.params.page ? route.params.page * 10 : 0,
      categorySlug: route.params.categorySlug === ALL
        ? null
        : route.params.categorySlug,
      size: route?.query?.size || "",
      color: route?.query?.color || ""
    }
    const res = await fetch(`api/productsearch`, {
      method: "POST",
      body: JSON.stringify(param),
      headers: {
        "Content-Type": "application/json",
      },

    });
    let searchResults = await res.json();
    //console.log("Search", searchResults)
    return { results: searchResults.results, total: searchResults.total, filterFacets: searchResults.facets }
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
