<template>
    <div class="py-3 my-3">
        <GoogleLogin :callback="callback" />
        <!-- <GoogleLogin :callback="custBTN">
                <button>Login Using Google</button>
            </GoogleLogin> -->
        <div class="font-italic text-danger" style="font-size: 11px;" v-if="nonSocial">Already registerd, Please login with
            password.</div>
    </div>
</template>
<script >
import { shallowRef } from 'vue';
import { decodeCredential } from 'vue3-google-login'
import useCustomerTools from 'hooks/useCustomerTools';


export default {
    setup() {
        const tools = useCustomerTools();
        const nonSocial = shallowRef(false);

        const callback = (response) => {
            try {
                const userData = decodeCredential(response.credential)
                console.log("Google UserData", userData)
                //check if customer already exist
                tools.checkUserExist(userData.email).then((res) => {
                    if (res?.data?.customers?.results && res?.data?.customers?.results.length == 1) {
                        let customer = res?.data?.customers?.results[0];
                        //customer found
                        console.log(`customer [${customer.email}] exists with initial reg type [${customer.companyName}]`)
                        if (customer.companyName && customer.companyName == "social") {
                            //directly login
                            tools.socialLogin(userData.email)
                        } else {
                            nonSocial.value = true;
                        }
                    } else {
                        //register user & login
                        let regData = {
                            firstName: userData.given_name,
                            lastName: userData.family_name ? userData.family_name : "",
                            email: userData.email,
                            agreeToTerms: true,
                            companyName: "social" //Used to set where customer initial registration from site or Social Auth
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
        return { callback, custBTN, nonSocial }
    }
};
</script>