
<template>
    <div class="pt-80 pb-100">
        <div class="container">
            <div class="order-complete ">
                <!-- <h2>{{ t('thankYou') }}</h2> -->
                <!-- <router-link class="mt-50" to="/">
                    {{ t('continueShopping') }}
                </router-link> -->
                <h1 class="pb-30">{{ t("title") }}</h1>
                <div class="">
                    <BaseForm :vuelidate="v" :onSubmit="createEnquiry" #default="{ error }">
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="single-input-item">
                                    <label for="first-name" class="required">{{
                                        t('firstName')
                                    }}</label>
                                    <BaseInput v-model="v.firstName.$model" :vuelidate="v.firstName" type="text"
                                        id="first-name" />
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="single-input-item">
                                    <label for="last-name" class="required">{{
                                        t('lastName')
                                    }}</label>
                                    <BaseInput v-model="v.lastName.$model" :vuelidate="v.lastName" type="text"
                                        id="last-name" />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="single-input-item">
                                    <label for="email" class="required">{{
                                        t('email')
                                    }}</label>
                                    <BaseInput v-model="v.email.$model" :vuelidate="v.email" type="email" id="email" />
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="single-input-item">
                                    <label for="phone" class="required">{{
                                        t('phone')
                                    }}</label>
                                    <BaseInput v-model="v.phone.$model" :vuelidate="v.phone" type="text" id="phone" />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="single-input-item">
                                    <label for="company" class="required">{{
                                        t('company')
                                    }}</label>
                                    <BaseInput v-model="v.company.$model" :vuelidate="v.company" type="text" id="company" />
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="single-input-item">
                                    <label for="helpType" class="required">{{
                                        t('helpType')
                                    }}</label>
                                    <BaseInput v-model="v.helpType.$model" :vuelidate="v.helpType" type="text"
                                        id="helpType" />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-lg-12">
                                <div class="single-input-item">
                                    <label for="msg" class="required">{{
                                        t('msg')
                                    }}</label>
                                    <BaseInput v-model="v.msg.$model" :vuelidate="v.msg" type="text" id="msg" />
                                </div>
                            </div>

                        </div>

                        <div class="single-input-item pt-30">
                            <button :disabled="v.$invalid" :class="v.$invalid ? 'disabled' : ''" type="submit"
                                class="check-btn sqr-btn">
                                {{ t('saveBtn') }}
                            </button>
                        </div>
                        <ServerError :error="error" class="server-error">{{
                            'unknownError'
                        }}</ServerError>
                    </BaseForm>
                </div>
                <div class="contact-cards">
                    <div class="card_wrapper">
                        <i class=" fa fa-briefcase" style="color: #bdbdbd;font-size: 32px;"></i>
                        <p style="text-align: center" class="">Sales</p>
                        <p style="text-align: center;"><strong><a href="mailto:sales@aiopsgroup.com" target="_blank"
                                    rel="noopener">sales@aiopsgroup.com</a></strong></p>
                    </div>

                    <div class="card_wrapper">
                        <i class=" fa fa-file-text-o" style="color: #bdbdbd;font-size: 32px;"></i>
                        <p style="text-align: center" class="">Inquiries</p>
                        <p style="text-align: center;"><strong><a href="mailto:contact@aiopsgroup.com" target="_blank"
                                    rel="noopener">contact@aiopsgroup.com</a></strong></p>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>


<script >

import { ref } from 'vue';
import { required, email } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import BaseInput from 'presentation/components/BaseInput/BaseInput.vue';
import BaseForm from 'presentation/components/BaseForm/BaseForm.vue';
import ServerError from 'presentation/components/ServerError/ServerError.vue';

function Rules() {
    this.email = { required, email };
    this.firstName = { required };
    this.lastName = { required };
    this.phone = { required };
    this.company = { required };
    this.helpType = { required };
    this.msg = { required };
}

export default {
    components: {
        BaseInput,
        BaseForm,
        ServerError

    },
    setup() {
        const { t } = useI18n({
            messages: {
                "en": {
                    "title": "Contact AIOPSGROUP",
                    "saveBtn": "Submit",
                    "firstName": "First Name",
                    "lastName": "Last Name",
                    "email": "Work Email",
                    "phone": "Phone Number",
                    "company": "Company Name",
                    "helpType": "How Can We Help You?",
                    "msg": "Message"

                },
                "de": {
                    "title": "Contact AIOPSGROUP",
                    "saveBtn": "Submit",
                    "firstName": "Vorname",
                    "lastName": "Nachname",
                    "email": "Email Adresse",
                    "phone": "Phone Number",
                    "company": "Company Name",
                    "helpType": "How Can We Help You?",
                    "msg": "Message"
                }
            }
        });
        const contactForm = ref({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            company: "",
            helpType: "",
            msg: ""

        })

        const rules = new Rules();
        const v = useVuelidate(rules, contactForm);

        const createEnquiry = () => {

        };
        return { t, v, createEnquiry };
    },
};


</script>

<style lang="scss" scoped>
.contact-cards {
    display: flex;
    margin-top: 45px;
    justify-content: center;
    column-gap: 15px;

    .card_wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border: 1px solid rgb(217, 217, 217);
        padding: 10px;
        border-radius: 5px;

        p {
            font-weight: 600;
            font-size: 18px;
            margin: 10px 0 10px;
        }
    }
}
</style>
