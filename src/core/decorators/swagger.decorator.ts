import { applyDecorators } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiBodyOptions,
    ApiConsumes,
    ApiHeader,
    ApiHeaderOptions,
    ApiOperation,
    ApiOperationOptions,
    ApiParam,
    ApiParamOptions,
    ApiQuery,
    ApiQueryOptions,
    ApiResponse,
    ApiResponseOptions,
    ApiTags,
} from '@nestjs/swagger';
import { COMMON_ERRORS_DEFINITION } from '../../config/errors/common.errors';
import { ApiErrorResponse } from './api-error-response.decorator';
import { SERVICE_ERRORS_DEFINITION } from 'src/config/errors/service.errors';

type CommonErrorKeys = keyof typeof COMMON_ERRORS_DEFINITION;
type SampleErrorKeys = keyof typeof SERVICE_ERRORS_DEFINITION;

type ErrorType =
  | (typeof COMMON_ERRORS_DEFINITION)[CommonErrorKeys]
  | (typeof SERVICE_ERRORS_DEFINITION)[SampleErrorKeys];

export interface SwaggerOptions {
  operation?: ApiOperationOptions;
  param?: ApiParamOptions;
  response?: ApiResponseOptions;
  errorResponse?: Array<ErrorType>;
  apiTags?: string;
  headers?: ApiHeaderOptions[];
  body?: ApiBodyOptions;
  consume?: string;
  query?: ApiQueryOptions[];
  bearerAuth?: boolean;
}

export function Swagger (options: SwaggerOptions) {
    const decorators = [];

    if (options.operation) {
        decorators.push(ApiOperation(options.operation));
    }

    if (options.param) {
        decorators.push(ApiParam(options.param));
    }

    if (options.response) {
        decorators.push(ApiResponse(options.response));
    }

    if (options.apiTags) {
        decorators.push(ApiTags(options.apiTags));
    }

    if (options.errorResponse) {
        decorators.push(ApiErrorResponse(options.errorResponse));
    }

    if (options.headers) {
        options.headers.forEach((header) => {
            decorators.push(ApiHeader(header));
        });
    }

    if (options.body) {
        decorators.push(ApiBody(options.body));
    }

    if (options.consume) {
        decorators.push(ApiConsumes(options.consume));
    }

    if (options.query) {
        options.query.forEach((query) => {
            decorators.push(ApiQuery(query));
        });
    }

    if (options.bearerAuth) {
        decorators.push(ApiBearerAuth('access-token'));
    }

    return applyDecorators(...decorators);
}
