import { ValidationPipe } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { getValidationErrors } from '../../utils/get-validation-errors';
import { ERRORS } from '../../config/errors/error';

export const MqValidationOptionsPipe = new ValidationPipe({
    exceptionFactory: (errors) => {
        const message = getValidationErrors(errors);
        return new RpcException(ERRORS('COMM0002', { message }));
    },
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
});
