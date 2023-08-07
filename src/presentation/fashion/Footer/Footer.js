import { useI18n } from 'vue-i18n';
import translation from './Footer.json'

export default {
  name: 'Footer',
  setup() {
    const { t } = useI18n({
      inheritLocale: true,
      useScope: 'local',
      messages: translation
    });
    return { t };
  },
};
