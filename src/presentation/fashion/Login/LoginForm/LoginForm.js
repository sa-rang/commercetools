// import { required, email } from 'vuelidate/lib/validators';
import { required, email } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import ServerError from 'presentation/components/ServerError/ServerError.vue';
import BaseForm from 'presentation/components/BaseForm/BaseForm.vue';
import BaseInput from 'presentation/components/BaseInput/BaseInput.vue';
import { useI18n } from 'vue-i18n';
import translation from './LoginForm.json'
import useCustomerTools from 'hooks/useCustomerTools';
import { ref } from 'vue';
import useAccessRules from 'hooks/useAccessRules';
import GoogleSignIn from "../SocialLogin/GoogleSignIn.vue"
import FacebookSignIn from "../SocialLogin/FacebookSignIn.vue"
function Rules() {
  this.password = { required };
  this.email = {
    required,
    email,
  };
}

export default {
  components: {
    BaseForm,
    BaseInput,
    ServerError,
    GoogleSignIn,
    FacebookSignIn
    // LoadingButton,
  },
  props: {},
  setup() {
    const { showResetPassword } = useAccessRules();
    const { t } = useI18n({
      messages: translation
    });
    const form = ref({
      email: '',
      password: '',
    });
    const rules = new Rules(form);
    const v = useVuelidate(rules, form);

    const tools = useCustomerTools();
    const customerSignMeIn = () =>
      tools.login(form.value.email, form.value.password);
    const getErrorMessage = (err) => {
      console.log(err)
      if (err?.extensions?.code === 'InvalidCredentials') {
        return t('invalidCredentials');
      }
      return t('unknownError');
    };
    return {
      v,
      customerSignMeIn,
      t,
      getErrorMessage,
      showResetPassword,
    };
  },
};
