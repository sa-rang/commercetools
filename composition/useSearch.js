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
    let ifSearchFromNPLWorking = false;
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
      if (searchResults) {
        ifSearchFromNPLWorking = true
      }
    } catch (error) {
      console.log("NLP search not working | redirected to Site search")
    }


    if (ifSearchFromNPLWorking) {
      return router.push({
        ...route,
        name: 'SearchList',
        query: {
          ...route.query,
          q,
        },
        params,
      });
    } else {
      return router.push({
        ...route,
        name: 'products',
        query: {
          ...route.query,
          q,
        },
        params,
      });
    }




  };

  return {
    search,
    setSearch,
  };
};
export default useSearch;
