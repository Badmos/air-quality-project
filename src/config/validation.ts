import * as Joi from 'joi';
export const validationSchema = Joi.object({
  IQAIR_API_KEY: Joi.string().required(),
});
