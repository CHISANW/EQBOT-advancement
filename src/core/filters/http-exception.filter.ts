import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { UNEXPECTED_ERROR_LOG } from 'src/config/constants/constants';
import { ERRORS } from 'src/config/errors/error';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor (private readonly clsService: ClsService) {}

    async catch (exception: HttpException, host: ArgumentsHost): Promise<void> {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse() as any;

        // ApiError을 통해 예외처리한 에러인 경우
        if (exceptionResponse?.errorCode) {
            response
                .status(status)
                .json(
                    errorResponse(exceptionResponse.errorCode, exceptionResponse.message),
                );
            return;
        }

        // NestJS에서 HttpException으로 처리하여 Filter로 들어온 경우
        if (exceptionResponse?.statusCode && exceptionResponse?.message) {
            response.status(status).json(
                errorResponse(
                    // 에러코드 제외 고민
                    ERRORS('COMM0001').errorCode,
                    exceptionResponse.message,
                ),
            );
            return;
        }

        // 예상치 못한 에러인 경우 중에서 NestJS에서 HttpException 처리하지 못하여 강제로 Filter로 들어온 경우
        this.clsService.set(UNEXPECTED_ERROR_LOG, exceptionResponse);
        response
            .status(status)
            .json(
                errorResponse(ERRORS('COMM0001').errorCode, ERRORS('COMM0001').message),
            );
    }
}

const errorResponse = (errorCode: string, message: string) => ({
    error: {
        code: errorCode,
        message,
    },
});
