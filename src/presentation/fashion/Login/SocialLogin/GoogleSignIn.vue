<template>
    <div class=" py-3 my-3">
        <GoogleLogin :callback="callback" />
        <!-- <GoogleLogin :callback="custBTN">
                <button>Login Using Google</button>
            </GoogleLogin> -->
    </div>
</template>
<script >
import { decodeCredential } from 'vue3-google-login'
import useCustomerTools from 'hooks/useCustomerTools';


export default {
    setup() {
        const tools = useCustomerTools();

        const callback = (response) => {
            try {
                const userData = decodeCredential(response.credential)
                console.log("Google UserData", userData)
                //check if customer already exist
                tools.checkUserExist(userData.email).then((res) => {
                    if (res?.data?.customers?.results && res?.data?.customers?.results.length == 1) {
                        //customer found
                        console.log("customer exists", userData.email)
                        //directly login
                        tools.socialLogin(userData.email)

                    } else {
                        //register user & login
                        let regData = {
                            firstName: userData.given_name,
                            lastName: userData.family_name ? userData.family_name : "",
                            email: userData.email,
                            agreeToTerms: true,
                        }
                        tools.signupSocial(regData)
                    }
                })
            } catch (error) {
                console.log(error)
            }

        }

        const custBTN = (response) => {
            console.log("Handle the response", response)
        }
        return { callback, custBTN }
    }
};
</script>