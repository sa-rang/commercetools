import {
  computed,
  onMounted,
  onUnmounted,
  shallowRef,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useMyOrder from 'hooks/useMyOrder';
import useMyOrders from 'hooks/useMyOrders';
import basic from './ct/useCustomerTools';
import {
  loginToken,
  logout as lo,
} from '../src/apollo/auth';
import { cache } from '../src/apollo';
import { CUSTOMER } from '../src/constants';
import { createReactive } from './lib';
import addVisibilityChangeListener from './lib';


addVisibilityChangeListener(
  ((value) => (status) => {
    const currentValue = localStorage.getItem(CUSTOMER);
    if (status) {
      //tab/window became visible see if item changed
      if (currentValue !== value) {
        //item changed in other tab or window, reset
        //  cache and reload from local storage
        value = currentValue;
        cache.reset();
        cache.gc();
        saveCustomerState(
          JSON.parse(localStorage.getItem(CUSTOMER))
        );
      }
    }

    value = currentValue;
  })(localStorage.getItem(CUSTOMER))
);

const saveCustomerState = (c) => {
  customerGlobal.setValue(c);
};
const createResetToken = basic.createResetToken;

const refreshUser = () =>
  basic
    .refreshUser()
    .then((result) =>
      saveCustomerState(result.data.me.customer)
    );
const updateUser = ({ firstName, lastName, email }) =>
  basic
    .updateUser({
      version: customerGlobal.ref.value.version,
      firstName,
      lastName,
      email,
    })
    .then((result) => {
      saveCustomerState(result.data.updateMyCustomer);
    });
const li = (email, password) =>
  basic
    .login(email, password)
    .then((data) => {
      return loginToken(email, password).then(() => data);
    })
    .then((result) => {
      saveCustomerState(
        result.data.customerSignMeIn.customer
      );
      //reset entire cache, customer may have specific prices
      cache.reset();
      return result;
    });
const customerGlobal = createReactive(
  JSON.parse(localStorage.getItem(CUSTOMER)),
  (newValue) =>
    localStorage.setItem(CUSTOMER, JSON.stringify(newValue))
);
function useCustomerTools() {
  const customer = shallowRef(customerGlobal.ref.value);
  const unListen = { fn: () => 88 };
  onMounted(() => {
    unListen.fn = customerGlobal.addListener((newValue) => {
      customer.value = newValue;
    });
  });
  onUnmounted(() => unListen.fn());
  const router = useRouter();
  const route = useRoute();
  const showLoggedIn = computed(() => {
    return Boolean(customer.value);
  });
  const signup = (form) =>
    basic
      .signup(form)
      .then((data) => {
        return loginToken(form.email, form.password).then(
          () => data
        );
      })
      .then((result) => {
        saveCustomerState(
          result.data.customerSignMeUp.customer
        );
        //reset entire cache, customer may have specific prices
        cache.reset();
        router.push({ name: 'user' });
        return result;
      });

  const signupSocial = (form) => {
    form.password = generatePassword(); //Random Password
    return basic
      .signup(form)
      .then((data) => {
        return loginToken(form.email, form.password).then(
          () => data
        );
      })
      .then((result) => {
        saveCustomerState(
          result.data.customerSignMeUp.customer
        );
        //reset entire cache, customer may have specific prices
        cache.reset();
        router.push({ name: 'user' });
        return result;
      });
  }


  const resetPassword = ({ token, newPassword }) =>
    basic.resetPassword({ token, newPassword }).then(() =>
      router.push({
        name: 'login',
      })
    );

  const logout = () => {
    lo();
    customerGlobal.setValue(null);
    //reset entire cache, customer may have had specific prices
    cache.reset();
    router.push({ name: 'login' });
  };
  const login = (email, password) =>
    li(email, password).then(() =>
      router.push({ name: 'user' })
    );

  const socialLogin = (email) => {
    let RandomPass = generatePassword();
    return basic
      .createResetToken(email)
      .then((token) => {

        return resetPassword({
          token: token.data.customerCreatePasswordResetToken
            .value, newPassword: RandomPass
        }).then(() => token);
      })
      .then(() => {
        return login(email, RandomPass)
      });
  }

  const returnItems = (id, version, items) => {
    return basic
      .returnItems(id, version, items)
      .then(() => {
        cache.evict({ id: 'orders' });
        cache.gc();
        router.push({
          name: 'order',
          params: { id },
        });
      });
  };
  const updateMyCustomerPassword = ({
    currentPassword,
    newPassword,
  }) =>
    basic
      .updateMyCustomerPassword({
        currentPassword,
        newPassword,
        version: customerGlobal.ref.value.version,
      })
      .then((result) => {
        const c = result.data.customerChangeMyPassword;
        saveCustomerState(c);
        return loginToken(c.email, newPassword);
      })
      .then(() => router.push({ name: 'user' }));
  const gotoResetToken = (token) =>
    router.push({
      name: 'reset-password',
      params: { token },
    });
  const { token } = route?.params || {};

  const checkUserExist = (email) => {
    return basic.checkUserExist(email)
  }

  const addUserAddress = (addressData) => {
    //console.log("Address", addressData)
    return basic.addUserAddress({ addressData, version: customer.value.version })
  }

  const updateUserAddress = (addressData) => {
    //console.log("Address", addressData)
    return basic.updateUserAddress({ addressData, version: customer.value.version })
  }


  const deleteUserAddress = (addressData) => {
    //console.log("Address", addressData)
    return basic.deleteUserAddress({ addressData, version: customer.value.version })
  }



  const generatePassword = (
    length = 10,
    characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$'
  ) =>
    Array.from(crypto.getRandomValues(new Uint32Array(length)))
      .map((x) => characters[x % characters.length])
      .join('')



  return {
    token,
    login,
    signup,
    showLoggedIn,
    customer,
    updateUser,
    logout,
    createResetToken,
    resetPassword,
    useMyOrders,
    useMyOrder,
    returnItems,
    gotoResetToken,
    refreshUser,
    updateMyCustomerPassword,
    checkUserExist,
    signupSocial,
    socialLogin,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress
  };
}
export default useCustomerTools;
