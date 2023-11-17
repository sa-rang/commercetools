import BillingDetails from './BillingDetails/BillingDetails.vue';
import OrderOverview from './OrderOverview/OrderOverview.vue';
import ServerError from 'presentation/components/ServerError/ServerError.vue';
import AddressDetails from './AddressDetails/AddressDetails.vue';
import { shallowRef, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import transaltion from './PageCheckout.json'
import { useRouter } from 'vue-router';
import useCart from 'hooks/useCart';
import useCartTools from 'hooks/useCartTools';
import useCustomerTools from 'hooks/useCustomerTools';

export default {
  components: {
    // CheckoutTopSection,
    OrderOverview,
    BillingDetails,
    ServerError,
    AddressDetails
  },
  setup() {
    const { t } = useI18n({
      messages: transaltion
    });
    const router = useRouter();
    const shippingMethod = shallowRef(null);
    const billingAddress = shallowRef(null);
    const shippingAddress = shallowRef(null);
    const saveAddress = shallowRef(false);
    const validBillingForm = shallowRef(false);
    const validShippingForm = shallowRef(true);
    const paymentMethod = shallowRef('card');
    const showError = shallowRef(false);
    const error = shallowRef(null);
    const { cart, loading } = useCart();
    const cartTools = useCartTools();
    const { customer, refreshUser } = useCustomerTools();
    const customerAddresses = shallowRef([])
    const billingAddressType = shallowRef(null)


    onMounted(async () => {
      await refreshUser()
      customerAddresses.value = customer.value?.addresses;
      if (customerAddresses.value && customerAddresses.value.length > 0) {
        billingAddressType.value = 'address'
      } else {
        billingAddressType.value = 'form'
      }
      //console.log(customer.value?.addresses)
    });
    //@todo: what happened to the payment method passed to this?
    const placeOrder = () => {
      if (!validBillingForm.value) {
        showError.value = true;
        return Promise.resolve();
      }
      showError.value = false;
      return cartTools
        .setAddressForCartAndCreateOrder({
          billingAddress,
          shippingAddress,
          saveAddress: saveAddress.value
        })
        .then(({ data }) => {
          console.log("upadte", data)
          router.push({
            name: 'pay',
            query: {
              id: data.updateOrder.orderId,
              v: data.updateOrder.version
            }
          });
        })
        .catch((e) => {
          error.value = e;
        });
    };
    watch([cart, loading], ([cart, loading]) => {
      if (!cart && !loading) {
        router.replace({ path: '/' });
      }
    });
    const setValidBillingForm = (valid) => {
      validBillingForm.value = valid;
    };
    const setValidShippingForm = (valid) => {
      validShippingForm.value = valid;
    };
    const updateBilling = (billingDetails) => {
      billingAddress.value = JSON.parse(
        JSON.stringify(billingDetails)
      );
    };
    const updateShipping = (shippingDetails) => {
      shippingAddress.value = JSON.parse(
        JSON.stringify(shippingDetails)
      );
    };
    const updateShippingMethod = (shippingId) => {
      shippingMethod.value = shippingId;
    };

    const saveAddressToggle = (iValue) => {
      saveAddress.value = iValue
      //console.log("toggle", saveAddress.value)
    }
    const addressSelected = (address) => {
      setValidBillingForm(true)
      setValidShippingForm(true)
      updateBilling(address)
      updateShipping(address)
      //console.log(address);
    }

    const setBillingAddressType = (iType) => {
      setValidBillingForm(false)
      setValidShippingForm(false)
      billingAddressType.value = iType
    }


    return {
      ...cartTools,
      placeOrder,
      shippingMethod,
      billingAddress,
      shippingAddress,
      validBillingForm,
      validShippingForm,
      showError,
      setValidBillingForm,
      setValidShippingForm,
      updateBilling,
      updateShipping,
      updateShippingMethod,
      paymentMethod,
      error,
      cart,
      t,
      saveAddressToggle,
      customerAddresses,
      addressSelected,
      billingAddressType,
      setBillingAddressType
    };
  },
};
