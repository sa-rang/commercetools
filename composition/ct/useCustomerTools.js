import gql from 'graphql-tag';
import { apolloClient } from '../../src/apollo';
import useMyOrder from 'hooks/useMyOrder';
import useMyOrders from 'hooks/useMyOrders';
export const loginVars = (email, password) => ({
  draft: {
    email,
    password,
  },
});
const customerFields = `
customerId: id
custom {
  customFieldsRaw {
    name
    value
  }
}
addresses {
  id
  firstName
  lastName
  streetName
  additionalStreetInfo
  postalCode
  city
  country
  phone
  email

}
version
email
firstName
lastName
version
customerNumber		
customerGroupRef {
  customerGroupId: id
}
`;
const createResetToken = (email) =>
  apolloClient.mutate({
    mutation: gql`
      mutation createResetToken($email: String!) {
        customerCreatePasswordResetToken(email: $email) {
          value
        }
      }
    `,
    variables: {
      email,
    },
  });
const returnItems = (id, version, items) => {
  return apolloClient.mutate({
    mutation: gql`
      mutation returnItems(
        $id: String
        $version: Long!
        $items: [ReturnItemDraftType!]!
      ) {
        updateOrder(
          version: $version
          id: $id
          actions: { addReturnInfo: { items: $items } }
        ) {
          orderNumber
        }
      }
    `,
    variables: {
      id,
      version,
      items: items.map((item) => ({
        ...item,
        shipmentState: 'Returned',
      })),
    },
  });
};
const resetPassword = ({ token, newPassword }) =>
  apolloClient.mutate({
    mutation: gql`
      mutation resetPassword(
        $tokenValue: String!
        $newPassword: String!
      ) {
        customerResetPassword(
          tokenValue: $tokenValue
          newPassword: $newPassword
        ) {
          firstName
        }
      }
    `,
    variables: {
      tokenValue: token,
      newPassword,
    },
  });
const signup = (form) => {
  return apolloClient.mutate({
    mutation: gql`
      mutation customerSignMeUp(
        $draft: CustomerSignMeUpDraft!
      ) {
        customerSignMeUp(draft: $draft) {
          customer {
            ${customerFields}
          }
        }
      }
    `,
    variables: {
      draft: {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      },
    },
  });
};

const signupSocial = (form) => {
  return apolloClient.mutate({
    mutation: gql`
      mutation customerSignUp(
        $draft: CustomerSignUpDraft!
      ) {
        customerSignUp(draft: $draft) {
          customer {
            ${customerFields}
          }
        }
      }
    `,
    variables: {
      draft: {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        authenticationMode: "ExternalAuth"
      },
    },
  });
};
const refreshUser = () =>
  apolloClient.query({
    fetchPolicy: 'network-only',
    query: gql`
      query queryMyCustomer {
        me {
          customer {
            ${customerFields}
          }
        }
      }
    `,
  });
const updateUser = ({
  version,
  firstName,
  lastName,
  email,
}) =>
  apolloClient.mutate({
    mutation: gql`
      mutation updateMyCustomer(
        $actions: [MyCustomerUpdateAction!]!
        $version: Long!
      ) {
        updateMyCustomer(
          version: $version
          actions: $actions
        ) {
          ${customerFields}
        }
      }
    `,
    variables: {
      version,
      actions: [
        { changeEmail: { email } },
        { setFirstName: { firstName } },
        { setLastName: { lastName } },
      ],
    },
  });


const login = (email, password) =>
  apolloClient.mutate({
    mutation: gql`
      mutation customerSignMeIn(
        $draft: CustomerSignMeInDraft!
      ) {
        customerSignMeIn(draft: $draft) {
          customer {
            ${customerFields}
          }
        }
      }
    `,
    variables: loginVars(email, password),
  });

const socialLogin = (email) =>
  apolloClient.mutate({
    mutation: gql`
      mutation customerSignIn(
        $draft: CustomerSignInDraft!
      ) {
        customerSignIn(draft: $draft) {
          customer {
            ${customerFields}
          }
        }
      }
    `,
    variables: {
      draft: {
        email,
        password: ""
      }
    },
  });


const updateMyCustomerPassword = ({
  currentPassword,
  newPassword,
  version,
}) => {
  return apolloClient.mutate({
    mutation: gql`
      mutation changePassword(
        $version: Long!
        $currentPassword: String!
        $newPassword: String!
      ) {
        customerChangeMyPassword(
          version: $version
          currentPassword: $currentPassword
          newPassword: $newPassword
        ) {
          ${customerFields}
        }
      }
    `,
    variables: {
      version,
      currentPassword,
      newPassword,
    },
  });
};

const checkUserExist = (email) =>
  apolloClient.query({
    query: gql`
      query queryCustomers($predicate: String){
       customers(limit: 1, where: $predicate) {
        results {
          email,
          }
        }
      }
    `,
    variables: {
      predicate: `email = "${email}"`
    },
    fetchPolicy: 'network-only',
  });

const addUserAddress = ({
  version,
  addressData
}) =>
  apolloClient.mutate({
    mutation: gql`
        mutation updateMyCustomer(
          $actions: [MyCustomerUpdateAction!]!
          $version: Long!
        ) {
          updateMyCustomer(
            version: $version
            actions: $actions
          ) {
            ${customerFields}
          }
        }
      `,
    variables: {
      version,
      actions: [
        {
          addAddress: {
            address: addressData
          }
        }
      ],
    },
  });



export default {
  signup,
  updateUser,
  createResetToken,
  resetPassword,
  useMyOrders,
  useMyOrder,
  returnItems,
  updateMyCustomerPassword,
  login,
  refreshUser,
  checkUserExist,
  signupSocial,
  socialLogin,
  addUserAddress
};
