import { StatusCode } from './status.code';

export const SERVICE_ERRORS_DEFINITION = {
    SAMP0001: {
        errorCode: 'SAMP0001',
        message: 'Unauthorized client',
        statusCode: StatusCode.UNAUTHORIZED,
    },
    SAMP0002: {
        errorCode: 'SAMP0002',
        message: 'Credit rate exceeded error',
        statusCode: StatusCode.TOO_MANY_REQUESTS,
    },
    SAMP0003: {
        errorCode: 'SAMP0003',
        message: 'Sample id: #{sampleId} not found error',
        statusCode: StatusCode.NOT_FOUND,
    },
    SAMP0004: {
        errorCode: 'SAMP0004',
        message: 'Sample id: #{sampleId}, User id: #{userId} sample error',
        statusCode: StatusCode.BAD_REQUEST,
    },
} as const;

/**
 * 유동적인 메세지를 위해 #{key} 형태로 작성하여 치환할 수 있습니다. key는 camelCase로 작성합니다.
 */
