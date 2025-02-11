import { ValidationPipe } from '@nestjs/common';
import { ApiError } from 'src/config/errors/api.error';
import { getValidationErrors } from 'src/utils/get-validation-errors';

export const GlobalValidationPipe = new ValidationPipe({
    exceptionFactory: (errors) => {
        const message = getValidationErrors(errors);
        return new ApiError('COMM0002', { message });
    },
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
});
