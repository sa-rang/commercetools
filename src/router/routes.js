import Root from 'containers/views/Shop/Root/Root.vue';
import config from '../../sunrise.config';
import Header from 'presentation/Header/Header.vue';
import Footer from 'presentation/Footer/Footer.vue';
import Products from 'presentation/ProductList/ProductList.vue';
import SearchList from 'presentation/SearchList/SearchList.vue'
import Product from 'presentation/PageProductDetail/PageProductDetail.vue';
import Checkout from 'presentation/PageCheckout/PageCheckout.vue';
// import Pay from 'presentation/Pay/Pay.vue';
import CheckoutHandler from 'presentation/PageCheckout/CheckoutHandler/CheckoutHandler.vue';
import ThankYou from 'presentation/PageCheckout/OrderSummery/ThankYou.vue';
import Login from 'presentation/Login/Login.vue';
import User from 'presentation/User/User.vue';
import TabDashboard from 'presentation/User/TabDashboard/TabDashboard.vue';
import TabAccountDetails from 'presentation/User/TabAccountDetails/TabAccountDetails.vue';
import TabChangePassword from 'presentation/User/TabChangePassword/TabChangePassword.vue';
import TabManageAddress from 'presentation/User/TabManageAddress/TabManageAddress.vue';
import ForgotPassword from 'presentation/Login/ForgotPassword/ForgotPassword.vue';
import ResetPassword from 'presentation/User/ResetPassword/ResetPassword.vue';
import TabOrderList from 'presentation/User/TabOrderList/TabOrderList.vue';
import TabOrderDetail from 'presentation/User/TabOrderDetail/TabOrderDetail.vue';
import TabReturn from 'presentation/User/TabReturn/TabReturn.vue';
import Cart from 'presentation/CartDetail/CartDetail.vue';
import Home from 'presentation/Home/Home.vue';
import StoreLocator from 'presentation/Stores/StoreLocator.vue';
import ContactUs from "presentation/ContactUs/ContactUs.vue"
import Search from "presentation/Search/Search.vue"
import PayAdmin from "presentation/PayAdmin/PayAdmin.vue"

const requiresAuth = true;
export default [
  {
    path: `/:country(${Object.keys(config.countries).join(
      '|'
    )})?/:locale(${Object.keys(config.languages).join(
      '|'
    )})?`,
    name: 'root',
    component: Root,
    children: [
      {
        path: 'products/:categorySlug/:page?',
        name: 'products',
        components: {
          default: Products,
          header: Header,
          // footer: null,
        },
      },
      {
        path: 'search-products/:categorySlug/:page?',
        name: 'SearchList',
        components: {
          default: SearchList,
          header: Header,
          // footer: null,
        },
      },
      {
        path: 'product/:productSlug/:sku',
        name: 'product',
        components: {
          default: Product,
          header: Header,
          footer: Footer,
        },
      },
      {
        path: 'checkout',
        name: 'checkout',
        // meta: { requiresCart },
        components: {
          default: Checkout,
          header: Header,
          footer: Footer,
        },
      },
      // {
      //   path: 'pay/:method/:payid',
      //   name: 'pay',
      //   // meta: { requiresCart },
      //   components: {
      //     default: Pay,
      //     header: Header,
      //     footer: Footer,
      //   },
      // },
      {
        path: 'pay',
        name: 'pay',
        // meta: { requiresCart },
        components: {
          default: CheckoutHandler,
          // header: Header,
          footer: Footer,
        },
      },
      {
        path: 'thankyou',
        name: 'thankyou',
        // meta: { requiresCart },
        components: {
          default: ThankYou,
          header: Header,
          footer: Footer,
        },
      },
      {
        path: 'login',
        name: 'login',
        components: {
          default: Login,
          header: Header,
          footer: Footer,
        },
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        components: {
          default: ForgotPassword,
          header: Header,
          footer: Footer,
        },
      },
      {
        path: 'reset-password/:token',
        name: 'reset-password',
        components: {
          default: ResetPassword,
          header: Header,
          footer: Footer,
        },
      },
      {
        path: 'user',
        meta: { requiresAuth },
        components: {
          default: User,
          header: Header,
          footer: Footer,
        },
        children: [
          {
            path: 'dashboard',
            alias: '',
            name: 'user',
            component: TabDashboard,
          },
          {
            path: 'order/:id',
            name: 'order',
            component: TabOrderDetail,
          },
          {
            path: 'return/:id',
            name: 'return',
            component: TabReturn,
          },
          {
            path: 'orders/:page?',
            name: 'orders',
            component: TabOrderList,
          },
          {
            path: 'account',
            name: 'account',
            component: TabAccountDetails,
          },
          {
            path: 'changepassword',
            name: 'changepassword',
            component: TabChangePassword,
          },
          {
            path: 'manageaddress',
            name: 'manageaddress',
            component: TabManageAddress,
          },
        ],
      },
      {
        path: 'cart',
        name: 'cart',
        components: {
          default: Cart,
          header: Header,
          footer: Footer,
        },
      },
      {
        path: '',
        name: 'home',
        components: {
          default: Home,
          header: Header,
          footer: Footer,
        },
      },
      {
        path: 'stores',
        name: 'stores',
        components: {
          default: StoreLocator,
          header: Header,
          footer: Footer,
        },
      },
      {
        path: 'contact-us',
        name: 'contact-us',
        components: {
          default: ContactUs,
          header: Header,
          footer: Footer,
        },
      },
      {
        path: 'search',
        name: 'search',
        components: {
          default: Search,
          header: Header,
          footer: Footer,
        },
      },
      {
        path: 'pay-admin',
        name: 'pay-admin',
        components: {
          default: PayAdmin,
          header: Header,
          footer: Footer,
        },
      },
    ],
  },
];
