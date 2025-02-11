import { HttpException } from '@nestjs/common';
import { ApiError } from 'src/config/errors/api.error';
import { COMMON_ERRORS_DEFINITION } from 'src/config/errors/common.errors';

export const axiosErrorHandler = (error: any) => {
    if (error.response) {
        responseErrorHandler(error);
    } else if (error.request) {
        requestErrorHandler(error);
    } else {
        throw error;
    }
};

const responseErrorHandler = (error: any) => {
    if (error.response.data?.error?.code) {
        throw new HttpException(
            {
                errorCode: error.response.data.error.code,
                message: error.response.data.error.message,
                statusCode: error.response.status || 500,
            },
            error.response.status || 500,
        );
    }

    throw new HttpException(
        {
            errorCode: COMMON_ERRORS_DEFINITION.COMM0001.errorCode,
            message:
        error.response.data?.message
        ?? error.response?.data
        ?? COMMON_ERRORS_DEFINITION.COMM0001.message,
            statusCode: error.response.status || 500,
        },
        error.response.status || 500,
    );
};

const requestErrorHandler = (_error: any) => {
    throw new ApiError('COMM0007');
};
