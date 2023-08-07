import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import translation from './BaseLabel.json'
import ValidationError from './ValidationError/ValidationError.vue';

export default {
  components: { ValidationError },
  props: {
    vuelidate: {
      type: Object,
    },
    label: {
      type: String,
    },
    customErrors: {
      type: Object,
    },
  },
  setup(props) {
    const { t } = useI18n({
      messages: translation
    });
    const required = computed(
      () => props.vuelidate?.required
    );
    return { t, required };
  },
};
