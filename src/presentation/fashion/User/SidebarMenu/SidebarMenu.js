import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import translation from './SidebarMenu.json'
import { useRoute } from 'vue-router';
import useCustomerTools from 'hooks/useCustomerTools';
import { googleLogout } from "vue3-google-login"

export default {
  props: {},
  setup() {
    const { t } = useI18n({
      messages: translation
    });
    const route = useRoute();
    const tools = useCustomerTools();
    const activeTab = computed(() => {
      return route.name;
    });

    const signOut = () => {
      tools.logout()
      googleLogout()
    }
    return { t, activeTab, signOut };
  },
};
