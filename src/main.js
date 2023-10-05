import { createApp, provide, h } from 'vue';
import { DefaultApolloClient } from '@vue/apollo-composable';
import App from './App.vue';
import { apolloClient } from './apollo';
import router from './router';
import VueGoogleMaps from '@fawmi/vue-google-maps';
import i18n from './i18n';
import 'presentation/assets/scss/main.scss';
import vue3GoogleLogin from 'vue3-google-login'

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },

  render: () => h(App),
})
  .use(vue3GoogleLogin, {
    clientId: "734370536691-ucurqi3it8106qdocudpvqgluqfi1cus.apps.googleusercontent.com"
  })
  .use(VueGoogleMaps, {
    load: {
      key: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
      libraries: 'places',
    },
  })
  .use(i18n)
  .use(router)


app.mount('#app');
