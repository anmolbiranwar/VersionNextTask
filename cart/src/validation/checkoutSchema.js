import * as yup from 'yup';

export const checkoutSchema = yup.object().shape({
  fullName: yup
    .string()
    .trim()
    .required('Name is required')
    .min(3, 'At least 3 characters')
    .max(60, 'Too long'),
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Enter a valid email'),
  phone: yup
    .string()
    .trim()
    .required('Phone is required')
    .matches(
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      'Enter valid phone number'
    ),
  address: yup
    .string()
    .trim()
    .required('Address is required')
    .min(5, 'At least 5 characters'),
  city: yup
    .string()
    .trim()
    .required('City is required'),
  state: yup
    .string()
    .trim()
    .required('State is required'),
  zipCode: yup
    .string()
    .trim()
    .required('ZIP code is required')
    .matches(/^[a-zA-Z0-9 -]{4,10}$/, 'Invalid postal code'),
  paymentMethod: yup
    .string()
    .oneOf(['card', 'upi', 'cod'], 'Select a payment method')
    .required('Payment method required'),
  cardNumber: yup.string().when('paymentMethod', {
    is: 'card',
    then: () =>
      yup
        .string()
        .required('Card number is required')
        .matches(/^\d{16}$/, 'Must be 16 digits'),
    otherwise: () => yup.string().notRequired(),
  }),
  cardExpiry: yup.string().when('paymentMethod', {
    is: 'card',
    then: () =>
      yup
        .string()
        .required('Expiry required')
        .matches(
          /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
          'Format MM/YY'
        ),
    otherwise: () => yup.string().notRequired(),
  }),
  cardCvv: yup.string().when('paymentMethod', {
    is: 'card',
    then: () =>
      yup
        .string()
        .required('CVV required')
        .matches(/^\d{3,4}$/, '3 or 4 digits'),
    otherwise: () => yup.string().notRequired(),
  }),
  upiId: yup.string().when('paymentMethod', {
    is: 'upi',
    then: () =>
      yup
        .string()
        .required('UPI ID is required')
        .matches(
          /^[\w.-]+@[\w.-]+$/,
          'Format: username@bank'
        ),
    otherwise: () => yup.string().notRequired(),
  }),
  termsAccepted: yup
    .boolean()
    .oneOf([true], 'Please accept the terms to continue'),
});
