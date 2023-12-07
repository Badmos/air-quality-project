import * as Joi from 'joi';

export const GetAirQualityValidation = Joi.object({
  latitude: Joi.number().min(-90).max(90).required().options({ convert: true }),
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .options({ convert: true }),
});
