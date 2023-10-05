<template>
    <div class="row ">
        <div class="col-lg-6 col-md-6">
            <GoogleLogin :callback="callback" />
        </div>
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
                console.log("Handle the userData", userData)
                //check if customer already exist
                tools.checkUserExist(userData.email).then((res) => {
                    if (res?.data?.customers?.results && res?.data?.customers?.results.length == 1) {
                        //customer found
                        console.log("customer exists", userData.email)
                        tools.socialLogin(userData.email)
                        //directly login
                    } else {
                        //register user & login

                        let regData = {
                            firstName: userData.name,
                            lastName: "",
                            email: userData.email,
                            // password: `${userData.name}@Aiops`,//this should be changed and moved to serverside, or uuid should be used
                            // repeatPassword: `${userData.name}@Aiops`, //this should be changed and moved to serverside, or uuid should be used
                            agreeToTerms: true,
                        }
                        tools.signupSocial(regData)
                    }
                })


            } catch (error) {
                console.log(error)
            }

        }
        return { callback }
    }
};
</script>