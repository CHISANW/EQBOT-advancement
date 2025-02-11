import * as changeKeys from 'change-case-commonjs';
import { SERVICE_ERRORS_DEFINITION } from './service.errors';
import { COMMON_ERRORS_DEFINITION } from './common.errors';

const ERROR_DEFINITIONS = {
    ...SERVICE_ERRORS_DEFINITION,
    ...COMMON_ERRORS_DEFINITION,
};
//
export const ERRORS = (
    errorCode: keyof typeof ERROR_DEFINITIONS,
    errorMessage?: {
        message?: string;
        replace?: Record<string, string | number>;
    },
) => {
    const errorDefinition = ERROR_DEFINITIONS[errorCode as keyof typeof ERROR_DEFINITIONS];

    if (errorMessage?.message) {
        return {
            errorCode: errorDefinition.errorCode,
            message: errorMessage.message,
            statusCode: errorDefinition.statusCode,
        };
    }

    if (errorMessage?.replace) {
        let updatedMessage: string = errorDefinition.message;

        // 치환할 값을 반복하며 메시지 내의 #{key}를 해당 값으로 대체
        Object.keys(errorMessage.replace).forEach((key) => {
            updatedMessage = updatedMessage.replace(
                new RegExp(`#{${changeKeys.camelCase(key)}}`, 'g'),
                errorMessage.replace[key].toString(),
            );
        });

        return {
            errorCode: errorDefinition.errorCode,
            message: updatedMessage,
            statusCode: errorDefinition.statusCode,
        };
    }

    return {
        errorCode: errorDefinition.errorCode,
        message: errorDefinition.message,
        statusCode: errorDefinition.statusCode,
    };
};

/**
 * @example
 * 에러메세지를 에러정의대로 출력 합니다.
 * throw new ApiError('SAMP0002');
 *
 * 정의된 에러메세지에 #{}이 포함되어 있을 경우, replace 옵션을 사용하여 치환 합니다.
 * throw new ApiError('SAMP0003', { replace: '6' });
 *
 * 에러메세지를 직접 입력하여 출력 합니다.
 * throw new ApiError('COMM0007', { message: 'cumtom message ~~' });
 */
