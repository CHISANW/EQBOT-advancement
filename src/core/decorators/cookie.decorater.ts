import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookie = createParamDecorator((data, etc: ExecutionContext) => {
    const request = etc.switchToHttp().getRequest();
    return data ? request.cookies[data] : request.cookies;
});
