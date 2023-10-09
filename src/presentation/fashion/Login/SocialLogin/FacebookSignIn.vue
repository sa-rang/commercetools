

<template>
    <div class="py-3 my-3">
        <button class="btn-facebook" @click.prevent="fbLogin">
            <i class="lab la-facebook"></i>
            <span>Facebook</span>
        </button>
    </div>
</template>

<script >

import useCustomerTools from 'hooks/useCustomerTools';
import {
    onMounted,
} from 'vue';

export default {
    setup() {
        const tools = useCustomerTools();
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
                        window.FB.api('/me?fields=id,name,email,first_name,last_name', (res) => {
                            console.log('Successful login for: ' + res.name);

                            // //check if customer already exist
                            tools.checkUserExist(res.email).then((res) => {
                                if (res?.data?.customers?.results && res?.data?.customers?.results.length == 1) {
                                    //customer found
                                    console.log("customer exists", res.email)
                                    //directly login
                                    tools.socialLogin(res.email)

                                } else {
                                    //register user & login
                                    let regData = {
                                        firstName: res.first_name,
                                        lastName: res.last_name ? res.last_name : "",
                                        email: res.email,
                                        agreeToTerms: true,
                                    }
                                    tools.signupSocial(regData)
                                }
                            })
                        });

                        /* make the API call */
                        // window.FB.api(`/${response.authResponse.userID}/`,
                        //     function (user) {
                        //         if (user && !user.error) {
                        //             /* handle the result */
                        //             console.log('user: ' + user);
                        //         }
                        //     }
                        // );

                        // window.FB.api('/me/permissions', (res) => {
                        //     console.log('Permissions: ' + res.data);
                        // });



                    } else {

                        // The person is not logged in through FB. 
                        console.log(response)

                    }

                }, { scope: "public_profile,email" });

            } catch (error) {
                console.log(error)
            }

        }


        return { fbLogin }
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