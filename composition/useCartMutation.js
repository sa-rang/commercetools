import org, { createPayment, createPaymentV2, addOrderNumberUpdateOrder, replicateCartMutation, updateOrderStatus } from './ct/useCartMutation';
import useCurrency from './useCurrency';
import useLocation from './useLocation';
import {
  addLineItem,
  changeCartLineItemQuantity,
  removeLineItem,
  addDiscountCode,
  removeDiscountCode,
  setShippingMethod,
  setBillingAddress,
  setShippingAddress,
  createMyOrderFromCart,
} from './ct/useCartMutation';
import useMiniCart from './useMinicart';
import useSelectedChannel from './useSelectedChannel';
import { getValue } from '../src/lib';
import { apolloClient, cache } from '../src/apollo';



export {
  addLineItem,
  changeCartLineItemQuantity,
  removeLineItem,
  addDiscountCode,
  removeDiscountCode,
  setShippingMethod,
  setBillingAddress,
  setShippingAddress,
  createMyOrderFromCart,
};

const useCartMutation = () => {
  const { location } = useLocation();
  const currency = useCurrency();
  return org({ location, currency });
};
export default useCartMutation;

export const useCartActions = () => {
  const { location } = useLocation();
  const { channel } = useSelectedChannel();
  const currency = useCurrency();
  const debounce = (fn, time = 200) => {
    const current = {};
    const check = { current };
    return (...args) => {
      const current = {};
      check.current = current;
      setTimeout(() => {
        if (check.current === current) {
          fn(...args);
        }
      }, time);
    };
  };
  const { error, mutateCart } = useCartMutation();
  const changeLine = debounce(
    (lineItemId, quantity = 1) => {
      if (!quantity || quantity < 0) {
        return;
      }
      mutateCart(
        changeCartLineItemQuantity(lineItemId, quantity)
      );
    }
  );
  const remove = (lineItemId) => {
    mutateCart(removeLineItem(lineItemId));
  };
  const addLine = (sku, quantity) => {
    const miniCart = useMiniCart();
    mutateCart(
      addLineItem(sku, quantity, channel.value?.id)
    );
    miniCart.toggle();
  }
  const applyDiscount = (code) =>
    mutateCart(addDiscountCode(code));
  const removeDiscount = (codeId) =>
    mutateCart(removeDiscountCode(codeId));
  const setShip = (shippingMethodId) =>
    mutateCart(setShippingMethod(shippingMethodId));

  const setBilling = (address) =>
    mutateCart(setBillingAddress(address));

  const setShipping = (address) =>
    mutateCart(setShippingAddress(address));

  const createMyOrder = ({ method, payId, centAmount }) => {
    return createPayment({
      currency: currency.value,
      centAmount: centAmount,
      method,
      payId
    })
      .then(({ id }) =>
        mutateCart([
          {
            addPayment: {
              payment: {
                id,
              },
            },
          },
        ])
      )
      .then(({ data }) => {
        const { id, version } = data.updateMyCart;
        return apolloClient.mutate(
          createMyOrderFromCart(id, version)
        );
      })
      .then(() => {
        cache.evict({ id: 'activeCart' });
        cache.gc();
      });
  };

  const setAddressForCartAndCreateOrder = ({
    billingAddress,
    shippingAddress,
  }) => {
    return Promise.resolve().then(() => {
      const actions = [
        setBillingAddress({
          ...getValue(billingAddress),
          country: location.value,
        }),
        setShippingAddress({
          ...(getValue(shippingAddress) ||
            getValue(billingAddress)),
          country: location.value,
        }),
      ];
      return mutateCart(actions).then(({ data }) => {//set billing shipping with actions
        const { id, version } = data.updateMyCart;
        //create order
        return apolloClient.mutate(
          createMyOrderFromCart(id, version)
        );
      }).then(({ data }) => { //set odernumber from FE
        //let orderNumber = "AiOPS-" + new Date().valueOf();
        // link payment to order in CT
        //return addOrderNumberUpdateOrder({ orderId: data.createMyOrderFromCart.orderId, orderNumber, version: data.createMyOrderFromCart.version })

        return createPaymentAndUpdateOrder({ centAmount: 0, orderId: data.createMyOrderFromCart.orderId, version: data.createMyOrderFromCart.version })
      })
    });
  };

  const createPaymentAndUpdateOrder = async ({ centAmount, orderId, version }) => {

    //let CTorderStatus = "Open" // Confirmed Complete Cancelled
    //let CTpayStatus = "Pending" // BalanceDue CreditOwed Failed Paid
    //let orderNumber = "AiOPS-" + new Date().valueOf();

    // if (payStatus == "Authorised") {
    //   CTorderStatus = "Open"
    //   CTpayStatus = "BalanceDue"
    // }

    // create payment in CT
    return createPaymentV2({
      currency: currency.value,
      centAmount: centAmount,
    })
      .then(({ id }) => {
        // link payment to order in CT
        //return addPaymentOnOrder({ orderId: orderId, version: orderVersion, paymentId: id, CTorderStatus, CTpayStatus })
        let orderNumber = "AiOPS-" + new Date().valueOf();
        return addOrderNumberUpdateOrder({ orderId, orderNumber, version, paymentId: id })
      })
  };

  const setOrderStatusCancelled = ({ orderId, orderVersion }) => {
    let CTorderStatus = "Cancelled"
    return updateOrderStatus({ orderId: orderId, version: orderVersion, CTorderStatus })
  };


  const replicateCart = ({ orderId }) => {
    return replicateCartMutation({ orderId: orderId })
  };



  return {
    error,
    changeLine,
    removeLineItem: remove,
    applyDiscount,
    removeDiscount,
    addLine,
    setShippingMethod: setShip,
    setBillingAddress: setBilling,
    setShippingAddress: setShipping,
    createMyOrderFromCart: createMyOrder,
    setAddressForCartAndCreateOrder,
    createPaymentAndUpdateOrder,
    replicateCart,
    setOrderStatusCancelled
  };
};
