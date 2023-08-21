import { VueperSlides, VueperSlide } from 'vueperslides';
import 'vueperslides/dist/vueperslides.css';
import { useI18n } from 'vue-i18n';
import locale from "./Banner.json"

export default {
  setup() {
    const { t } = useI18n({
      inheritLocale: true,
      useScope: 'local',
      messages: locale
    });
    return {
      t,
    };
  },
  components: {
    VueperSlides,
    VueperSlide,
  },
  data: () => ({
    autoPlaying: true,
    internalAutoPlaying: true,
    slides: [
      {
        title: 'Slide 1',
        content: {
          bgImage: 'banner1.jpg',
          h3Message: 'midSeasonSale',
          h1Message: 'up70',
          bttnText: 'shopNow',
          link: "/products/all?q=jacket"
        },
      },
      {
        title: 'Slide 2',
        content: {
          bgImage: 'banner3.jpg',
          h3Message: 'checkout',
          h1Message: 'newCollection',
          bttnText: 'shopNow',
          link: "/products/men"
        },
      },
      {
        title: 'Slide 3',
        content: {
          bgImage: 'banner2.jpg',
          h3Message: 'checkout',
          h1Message: 'newCollection',
          bttnText: 'shopNow',
          link: "/products/women"
        },
      },
    ],
  }),
};
