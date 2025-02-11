import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { COMMON_ERRORS_DEFINITION } from '../../config/errors/common.errors';
import { SERVICE_ERRORS_DEFINITION } from 'src/config/errors/service.errors';

type CommonErrorKeys = keyof typeof COMMON_ERRORS_DEFINITION;
type SampleErrorKeys = keyof typeof SERVICE_ERRORS_DEFINITION;

type ErrorType =
  | (typeof COMMON_ERRORS_DEFINITION)[CommonErrorKeys]
  | (typeof SERVICE_ERRORS_DEFINITION)[SampleErrorKeys];

export function ApiErrorResponse (errors: Array<ErrorType>) {
    const errorResponses = errors.map((error) => ApiResponse({
        status: error.statusCode,
        description: error.message,
        schema: {
            type: 'object',
            properties: {
                error: {
                    type: 'object',
                    properties: {
                        code: { type: 'string', example: error.errorCode },
                        message: { type: 'string', example: error.message },
                    },
                },
            },
        },
    }));

    return applyDecorators(...errorResponses);
}
