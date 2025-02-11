import { ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ERRORS } from 'src/config/errors/error';
import { getValidationErrors } from 'src/utils/get-validation-errors';

export const SocketValidationOptionsPipe = new ValidationPipe({
    exceptionFactory: (errors) => {
        const message = getValidationErrors(errors);
        return new WsException(ERRORS('COMM0002', { message }));
    },
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
});
