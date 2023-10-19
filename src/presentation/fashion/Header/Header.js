// import CategoriesMenu from "../CategoriesMenu";
import LoginButton from './LoginButton/LoginButton.vue';
// import LocationSelector from "../LocationSelector/LocationSelector.vue";

import Selector from './Selector/Selector.vue';
import CategoriesMenu from 'presentation/components/CategoriesMenu';
import { useI18n } from 'vue-i18n';
import transtation from './Header.json'
import { computed, ref, shallowRef } from 'vue';
import useSearch from 'hooks/useSearch';
import useLocale from 'hooks/useLocale';
import useLocation from 'hooks/useLocation';
import useCart from 'hooks/useCart';
import useMiniCart from 'hooks/useMinicart';
import sunriseConfig from '../../../../sunrise.config';
import useAccessRules from 'hooks/useAccessRules';

export default {
  name: 'HeaderPresentation',
  setup() {
    const locale = useLocale();
    const location = useLocation();
    const { cart, exist } = useCart();
    const { search: s, setSearch } = useSearch();
    const search = shallowRef(s.value);
    const totalCartItems = computed(() =>
      exist.value && cart.value
        ? cart.value.lineItems
          .map(({ quantity }) => quantity)
          .reduce((sum, q) => sum + q, 0)
        : 0
    );
    const locations = Object.keys(sunriseConfig.countries);
    const locales = Object.keys(sunriseConfig.languages);
    const miniCart = useMiniCart();

    //@todo: what do we do with this one? Do we have to get this every time?
    const { t } = useI18n({
      messages: transtation
    });
    const searchOpen = ref(false);
    // const mobileMenuOpen = ref(false);

    const toggleSearch = () => {
      searchOpen.value = !searchOpen.value;
    };
    const doSearch = () => {
      toggleSearch();
      fetch(`https://6e24-103-135-229-245.ngrok.io/getProducts?search=${search.value}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((data) => {
        return data.json()
      }).then((data) => {
        console.log(data)
        setSearch(search.value);
      });


    };
    const { showStoreSelector, showLocationSelector } =
      useAccessRules();

    const openHelpPopup = () => {
      let lft = window.innerWidth - 800;
      window.open('help.html', 'Help', `width=450,height=650,top=0,left=${lft},scrollbars=yes`);
    }
    return {
      t,
      doSearch,
      toggleSearch,
      searchOpen,
      ...locale,
      miniCart,
      locales,
      ...location,
      locations,
      search,
      setSearch,
      totalCartItems,
      showStoreSelector,
      showLocationSelector,
      totalShoppingCartItems: 0, //@todo: need this one??
      openHelpPopup
    };
  },
  components: {
    Selector,
    CategoriesMenu,
    LoginButton,
  },
};
