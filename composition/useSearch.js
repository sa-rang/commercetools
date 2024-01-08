import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const useSearch = () => {
  const route = useRoute();
  const router = useRouter();
  const search = computed(() => route?.query?.q || '');
  const setSearch = async (q) => {
    const params = {
      categorySlug: route?.params?.categorySlug || 'all',
    };

    //NLP api health check logic //Not the best but asked to do as poc, anyways

    try {
      let param = {
        search: 'bags'
      }
      const res = await fetch(`api/productsearch`, {
        method: "POST",
        body: JSON.stringify(param),
        headers: {
          "Content-Type": "application/json",
        },
      });
      let searchResults = await res.json();
      if (searchResults?.error) {
        console.log("NLP search not working | redirected to Site search")
        return router.push({
          ...route,
          name: 'products',
          query: {
            ...route.query,
            q,
          },
          params,
        });
      } else {
        console.log("NLP search")
        return router.push({
          ...route,
          name: 'SearchList',
          query: {
            ...route.query,
            q,
          },
          params,
        });
      }
    } catch (error) {
      console.error(`Error: ${error} `);

    }
  };

  return {
    search,
    setSearch,
  };
};
export default useSearch;
