import Joi, { ObjectSchema } from 'joi';

const courseCreateSchema: ObjectSchema = Joi.object().keys({
  instructorId: Joi.string().required().messages({
    'string.base': 'Instructor Id must be of type string',
    'string.empty': 'Instructor Id is required',
    'any.required': 'Instructor Id is required',
  }),
  profilePicture: Joi.string().required().messages({
    'string.base': 'Please add a profile picture',
    'string.empty': 'Profile picture is required',
    'any.required': 'Profile picture is required',
  }),
  title: Joi.string().required().messages({
    'string.base': 'Please add a course title',
    'string.empty': 'Course title is required',
    'any.required': 'Course title is required',
  }),
  description: Joi.string().required().messages({
    'string.base': 'Please add a course description',
    'string.empty': 'Course description is required',
    'any.required': 'Course description is required',
  }),
  categories: Joi.string().required().messages({
    'string.base': 'Please select a category',
    'string.empty': 'Course category is required',
    'any.required': 'Course category is required',
  }),
  subCategories: Joi.array().items(Joi.string()).required().min(1).messages({
    'string.base': 'Please add at least one subcategory',
    'string.empty': 'Course subcategories are required',
    'any.required': 'Course subcategories are required',
    'array.min': 'Please add at least one subcategory',
  }),
  tags: Joi.array().items(Joi.string()).required().min(1).messages({
    'string.base': 'Please add at least one tag',
    'string.empty': 'Course tags are required',
    'any.required': 'Course tags are required',
    'array.min': 'Please add at least one tag',
  }),
  price: Joi.number().required().greater(4.99).messages({
    'string.base': 'Please add a course price',
    'string.empty': 'Course price is required',
    'any.required': 'Course price is required',
    'number.greater': 'Course price must be greater than $4.99',
  }),
  coverImage: Joi.string().required().messages({
    'string.base': 'Please add a cover image',
    'string.empty': 'Course cover image is required',
    'any.required': 'Course cover image is required',
    'array.min': 'Please add a cover image',
  }),
  expectedDuration: Joi.string().required().messages({
    'string.base': 'Please add expected delivery',
    'string.empty': 'Course expected delivery is required',
    'any.required': 'Course expected delivery is required',
    'array.min': 'Please add expected delivery',
  }),
  basicTitle: Joi.string().required().messages({
    'string.base': 'Please add basic title',
    'string.empty': 'Course basic title is required',
    'any.required': 'Course basic title is required',
    'array.min': 'Please add a basic title',
  }),
  basicDescription: Joi.string().required().messages({
    'string.base': 'Please add basic description',
    'string.empty': 'Course basic description is required',
    'any.required': 'Course basic description is required',
    'array.min': 'Please add a basic description',
  }),
});

const courseUpdateSchema: ObjectSchema = Joi.object().keys({
  title: Joi.string().required().messages({
    'string.base': 'Please add a course title',
    'string.empty': 'Course title is required',
    'any.required': 'Course title is required',
  }),
  description: Joi.string().required().messages({
    'string.base': 'Please add a course description',
    'string.empty': 'Course description is required',
    'any.required': 'Course description is required',
  }),
  categories: Joi.string().required().messages({
    'string.base': 'Please select a category',
    'string.empty': 'Course category is required',
    'any.required': 'Course category is required',
  }),
  subCategories: Joi.array().items(Joi.string()).required().min(1).messages({
    'string.base': 'Please add at least one subcategory',
    'string.empty': 'Course subcategories are required',
    'any.required': 'Course subcategories are required',
    'array.min': 'Please add at least one subcategory',
  }),
  tags: Joi.array().items(Joi.string()).required().min(1).messages({
    'string.base': 'Please add at least one tag',
    'string.empty': 'Course tags are required',
    'any.required': 'Course tags are required',
    'array.min': 'Please add at least one tag',
  }),
  price: Joi.number().required().greater(4.99).messages({
    'string.base': 'Please add a course price',
    'string.empty': 'Course price is required',
    'any.required': 'Course price is required',
    'number.greater': 'Course price must be greater than $4.99',
  }),
  coverImage: Joi.string().required().messages({
    'string.base': 'Please add a cover image',
    'string.empty': 'Course cover image is required',
    'any.required': 'Course cover image is required',
    'array.min': 'Please add a cover image',
  }),
  expectedDuration: Joi.string().required().messages({
    'string.base': 'Please add expected delivery',
    'string.empty': 'Course expected delivery is required',
    'any.required': 'Course expected delivery is required',
    'array.min': 'Please add expected delivery',
  }),
  basicTitle: Joi.string().required().messages({
    'string.base': 'Please add basic title',
    'string.empty': 'Course basic title is required',
    'any.required': 'Course basic title is required',
    'array.min': 'Please add a basic title',
  }),
  basicDescription: Joi.string().required().messages({
    'string.base': 'Please add basic description',
    'string.empty': 'Course basic description is required',
    'any.required': 'Course basic description is required',
    'array.min': 'Please add a basic description',
  }),
});

export { courseCreateSchema, courseUpdateSchema };
