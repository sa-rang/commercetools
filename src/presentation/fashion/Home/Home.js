import { useI18n } from 'vue-i18n';
import locale from "./Home.json"
import Banner from 'presentation/Banner/Banner.vue';
import BaseMoney from 'presentation/components/BaseMoney/BaseMoney.vue';
import { useRouter } from 'vue-router';
import ProductShowcase from "./ProductShowcase.vue";

export default {
  name: 'Home',
  components: { Banner, BaseMoney, ProductShowcase },

  setup() {
    const router = useRouter();
    if (window.innerWidth < 990) {
      router.replace({
        name: 'products',
        params: { categorySlug: 'all' },
      });
    }
    const { t } = useI18n({
      messages: locale
    });
    return {
      t,
    };
  },
};
