import { useI18n } from 'vue-i18n';
import locale from "./LoginButton.json"
import useCustomerTools from 'hooks/useCustomerTools';

export default {
  props: {},
  setup() {
    const { t } = useI18n({
      messages: locale
    });
    const { showLoggedIn } = useCustomerTools();
    return { t, showLoggedIn };
  },
};
