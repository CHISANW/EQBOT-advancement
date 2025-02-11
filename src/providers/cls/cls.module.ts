import { Module } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { v1 as uuid } from 'uuid';
import { ClsModule } from 'nestjs-cls';

@Module({
    imports: [
        ClsModule.forRoot({
            global: true,
            middleware: {
                mount: true,
                generateId: true,
                idGenerator: (req: Request) => {
                    const requestId = req.headers['x-request-id'];

                    // 헤더 값이 존재하고 유효한 UUID인지 검증
                    if (requestId && isUUID(requestId as string)) {
                        return requestId;
                    }

                    // 헤더 값이 존재하지 않거나 유효하지 않은 요청에 대해 예외처리를 원할 경우 아래 주석 해제
                    // throw new ApiError(ERRORS.COMM0005);

                    return uuid();
                },
            },
        }),
    ],
})
export class ClsConfigModule {}
