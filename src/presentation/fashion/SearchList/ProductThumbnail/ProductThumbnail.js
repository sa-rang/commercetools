import { useI18n } from 'vue-i18n';
import localeJson from "./ProductThumbnail.json"
import BasePrice from 'presentation/components/BasePrice/BasePrice.vue';
import { computed } from 'vue';
import useLocale from 'hooks/useLocale';

export default {
  name: 'ProductThumbnail',
  components: {
    BasePrice,
  },
  props: {
    product: {
      type: Object,
      required: true,
    },
    addToCart: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const { locale } = useLocale();

    const productRoute = (productSlug, sku) => ({
      name: 'product',
      params: {
        productSlug: productSlug[locale.value],
        sku,
      },
    });
    const productName = (productName) => productName[locale.value];
    const displayedImageUrl = (variant) => {
      if (
        Array.isArray(variant.images) &&
        variant.images.length
      ) {
        return variant.images[0].url;
      }
      return require('presentation/assets/img/missing.svg');
    };
    const { t } = useI18n({
      messages: localeJson
    });
    const hasPrice = computed(
      () => props?.product?.masterVariant?.scopedPrice
    );
    const hasDiscount = computed(
      () =>
        props?.product?.masterVariant?.scopedPrice
          ?.discounted
    );
    return {
      productRoute,
      displayedImageUrl,
      t,
      hasPrice,
      hasDiscount,
      productName
    };
  },
};
