import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { SubscribeMessage } from '@nestjs/websockets';
import { SocketInterceptor } from '../interceptors/socket.interceptor';

export function SocketDecorator (subscribeEvent: string, receiveEvent?: string) {
    const decorators = [];

    decorators.push(SubscribeMessage(subscribeEvent));
    if (receiveEvent) {
        decorators.push(UseInterceptors(new SocketInterceptor(receiveEvent)));
    }
    decorators.push(UseInterceptors(new SocketInterceptor(subscribeEvent)));
    return applyDecorators(...decorators);
}
