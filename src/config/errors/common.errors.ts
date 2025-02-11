import { StatusCode } from './status.code';

/**
 * ERROR CODE 추가할 경우 아래사항을 반드시 지켜주세요
 * ERRORS 객체에 에러내용 추가
 *  - errorCdoe: {분류코드} + {에러번호}
 *  - message: 에러메시지는 에러를 설명하기 위한 문장으로 구성
 *  - statusCode: 에러 발생시 클라이언트에게 전달할 HTTP 상태 코드
 *
 *
 * 유동적인 메세지를 위해 #{key} 형태로 작성하여 치환할 수 있습니다. key는 camelCase로 작성합니다.
 */

export const COMMON_ERRORS_DEFINITION = {
    COMM0001: {
        errorCode: 'COMM0001',
        message: 'Internal Server Error',
        statusCode: StatusCode.INTERNAL_SERVER_ERROR,
    },
    COMM0002: {
        errorCode: 'COMM0002',
        message: 'Validation Error',
        statusCode: StatusCode.BAD_REQUEST,
    },
    COMM0003: {
        errorCode: 'COMM0003',
        message: 'Request Timeout',
        statusCode: StatusCode.REQUEST_TIMEOUT,
    },
    COMM0004: {
        errorCode: 'COMM0004',
        message: 'Invalid x-request-id',
        statusCode: StatusCode.BAD_REQUEST,
    },
    COMM0005: {
        errorCode: 'COMM0005',
        message: 'Missing authentication fields',
        statusCode: StatusCode.UNAUTHORIZED,
    },
    COMM0006: {
        errorCode: 'COMM0006',
        message: 'Send Mail Failed',
        statusCode: StatusCode.INTERNAL_SERVER_ERROR,
    },
    COMM0007: {
        errorCode: 'COMM0007',
        message: 'Service Unavailable',
        statusCode: StatusCode.SERVICE_UNAVAILABLE,
    },
    COMM0008: {
        errorCode: 'COMM0008',
        message: 'Please authenticate',
        statusCode: StatusCode.UNAUTHORIZED,
    },
    COMM0009: {
        errorCode: 'COMM0009',
        message: 'Unauthorized client',
        statusCode: StatusCode.UNAUTHORIZED,
    },
    COMM0010: {
        errorCode: 'COMM0010',
        message: 'Expired Token',
        statusCode: StatusCode.UNAUTHORIZED,
    },
    COMM0011: {
        errorCode: 'COMM0011',
        message: 'Jwt token error',
        statusCode: StatusCode.UNAUTHORIZED,
    },
    COMM0012: {
        errorCode: 'COMM0012',
        message: 'No data to send',
        statusCode: StatusCode.BAD_REQUEST,
    },
    COMM0013: {
        errorCode: 'COMM0013',
        message: 'Event is required',
        statusCode: StatusCode.BAD_REQUEST,
    },
    COMM0014: {
        errorCode: 'COMM0014',
        message: 'Credit rate exceeded error',
        statusCode: StatusCode.TOO_MANY_REQUESTS,
    },
} as const;
