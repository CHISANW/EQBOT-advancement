import * as changeKeys from 'change-case-commonjs';
import { HttpException } from '@nestjs/common';
import { SERVICE_ERRORS_DEFINITION } from './service.errors';
import { COMMON_ERRORS_DEFINITION } from './common.errors';
import { StatusCode } from './status.code';

const ERROR_DEFINITIONS = {
    ...SERVICE_ERRORS_DEFINITION,
    ...COMMON_ERRORS_DEFINITION,
};

export interface IApiError {
    errorCode: string;
    message: string;
    statusCode: StatusCode;
}

export class ApiError extends HttpException {
    constructor (
        errorCode: keyof typeof ERROR_DEFINITIONS,
        replaceOptions?: {
            message?: string;
            variables?: Record<string, string | number>;
        },
    ) {
        const errorDefinition = ERROR_DEFINITIONS[errorCode as keyof typeof ERROR_DEFINITIONS];

        let errMessage: string = errorDefinition.message;
        if (replaceOptions?.message) {
            errMessage = replaceOptions.message;
        } else if (replaceOptions?.variables) {
            Object.keys(replaceOptions.variables).forEach((key) => {
                errMessage = errMessage.replace(
                    new RegExp(`#{${changeKeys.camelCase(key)}}`, 'g'),
                    replaceOptions.variables[key].toString(),
                );
            });
        }

        const errorResponse: IApiError = {
            errorCode: errorDefinition.errorCode,
            message: errMessage,
            statusCode: errorDefinition.statusCode,
        };

        super(errorResponse, errorResponse.statusCode);
    }
}
