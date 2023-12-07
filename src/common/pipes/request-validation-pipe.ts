import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: Joi.Schema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    // Process the value if it's for query parameters
    const processedValue = metadata.type === 'query' ? { ...value } : value;

    const { error, value: validatedValue } = this.schema.validate(
      processedValue,
      {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      },
    );

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      throw new HttpException(
        {
          status: false,
          message: errorMessage,
          data: null,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return validatedValue;
  }
}
