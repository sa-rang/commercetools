<template>
    <div>
        <div class="thank-you">
            <div class="container">
                <div class="row">
                    <div class="col-lg-6 offset-lg-3 mt-50 text-center">
                        <h2>Thank You</h2>
                        <p>Your order <b>{{ orderNumber }}</b> has been placed successfully.</p>
                        <router-link class=" btn-grey mt-50" to="/">
                            Continue Shopping
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script >

import { onMounted, shallowRef } from 'vue';
import { useRoute } from 'vue-router';

export default {
    setup() {

        const route = useRoute();
        const orderNumber = shallowRef(route.query.id)
        onMounted(async () => {
        });


        return { orderNumber }
    }
}
</script>

<style lang="scss" scoped>
.thank-you {
    margin-top: 50px;
    margin-bottom: 100px;
}
</style>
  