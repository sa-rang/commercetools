
<template>
  <div class="container pt-80 pb-100">
    <div class="row mt-30">
      <div class="col-md-6">
        <h3>Capture Payment</h3>
        <label class="mt-30" for="ordernumber">Order Number:</label>
        <input type="text" placeholder="Order Number" v-model="orderNumber" name="ordernumber" />
        <button class="mt-30" @click="capturePayment">Capture Payment</button>
      </div>
      <div v-if="captureResult && captureResult.capture == 'received'" class="col-md-6">
        <h4 class="text-success">Payment captured for {{ orderNumber }}</h4>
      </div>
      <div v-else-if="captureResult && captureResult.capture == 'alreadyreceived'" class="col-md-6">
        <h4 class="text-success">Payment already received for {{ orderNumber }}</h4>
      </div>
    </div>
  </div>
</template>


<script >

import { ref } from 'vue';

export default {

  setup() {
    const orderNumber = ref("")
    const captureResult = ref(null)

    const capturePayment = async () => {
      let payload = {
        orderNumber: orderNumber.value
      }

      const res = await fetch("/api/capture", {
        method: "POST",
        body: payload ? JSON.stringify(payload) : "",
        headers: {
          "Content-Type": "application/json",
        },
      });
      let jsonRes = await res.json();
      console.log(jsonRes);
      captureResult.value = jsonRes
    }




    return {
      orderNumber,
      captureResult,
      capturePayment
    };
  },
};


</script>

<style lang="scss" scoped>
.search {}
</style>
