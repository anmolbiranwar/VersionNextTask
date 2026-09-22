import * as yup from 'yup';

export const productSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Product name is required')
    .min(3, 'Must be at least 3 characters')
    .max(80, 'Cannot exceed 80 characters'),
  category: yup
    .string()
    .trim()
    .required('Category is required'),
  price: yup
    .number()
    .typeError('Enter a valid price')
    .required('Price is required')
    .positive('Must be greater than 0')
    .max(10000, 'Cannot exceed $10,000'),
  rating: yup
    .number()
    .typeError('Rating must be a number')
    .min(1, 'Minimum 1.0')
    .max(5, 'Maximum 5.0')
    .default(4.5),
  description: yup
    .string()
    .trim()
    .required('Description is required')
    .min(10, 'Must be at least 10 characters')
    .max(300, 'Cannot exceed 300 characters'),
  image: yup
    .string()
    .trim()
    .required('Image URL is required')
    .url('Enter a valid URL'),
});
