

<template>
    <div class="py-3 my-3">
        <button class="btn-facebook" @click.prevent="fbLogin">
            <i class="lab la-facebook"></i>
            <span>Login with Facebook</span>
        </button>
        <div class="font-italic text-danger" style="font-size: 11px;" v-if="nonSocial">Already registerd, Please login with
            password.</div>
    </div>
</template>

<script >

import useCustomerTools from 'hooks/useCustomerTools';
import {
    shallowRef,
    onMounted,
} from 'vue';

export default {
    setup() {
        const tools = useCustomerTools();
        const nonSocial = shallowRef(false);
        onMounted(() => {
            window.FB.init({
                appId: process.env.VUE_APP_FACEBOOK_APP_ID,
                cookie: true,                     // Enable cookies to allow the server to access the session.
                xfbml: true,                     // Parse social plugins on this webpage.
                version: 'v18.0'           // Use this Graph API version for this call.
            });
        });

        const fbLogin = () => {
            try {
                window.FB.login((response) => {
                    console.log(response)
                    if (response.status === 'connected') {
                        // // Logged in through FB
                        window.FB.api('/me?fields=id,name,email,first_name,last_name', (FBres) => {
                            console.log('Successful login for: ' + FBres.name);

                            // //check if customer already exist
                            tools.checkUserExist(FBres.email).then((custRes) => {
                                if (custRes?.data?.customers?.results && custRes?.data?.customers?.results.length == 1) {

                                    let customer = custRes?.data?.customers?.results[0];
                                    //customer found
                                    console.log(`customer [${customer.email}] exists with initial reg type [${customer.companyName}]`)
                                    if (customer.companyName && customer.companyName == "social") {
                                        //directly login
                                        tools.socialLogin(FBres.email)
                                    } else {
                                        nonSocial.value = true;
                                    }
                                } else {
                                    //register user & login
                                    let regData = {
                                        firstName: FBres.first_name,
                                        lastName: FBres.last_name ? FBres.last_name : "",
                                        email: FBres.email,
                                        agreeToTerms: true,
                                        companyName: "social" //Used to set where customer initial registration from site or Social Auth
                                    }
                                    tools.signupSocial(regData)
                                }
                            })
                        });

                    } else {
                        // The person is not logged in through FB. 
                        console.log(response)
                    }
                }, { scope: "public_profile,email" });

            } catch (error) {
                console.log(error)
            }
        }
        return { fbLogin, nonSocial }
    }
};
</script>

<style lang="scss">
.btn-facebook {
    padding: 13px;
    display: flex;
    align-items: center;
    margin-left: 15px;
    background: #3B5998;
    color: #fff;

    &:hover {
        color: #fff;
        opacity: 0.8;
        background: #3B5998;
    }
}
</style>