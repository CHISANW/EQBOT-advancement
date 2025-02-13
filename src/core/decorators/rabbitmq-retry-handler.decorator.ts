import { waitForSeconds } from '../../utils/wait';
import { RpcException } from '@nestjs/microservices';

// retry decorator
export const RabbitMqRetryHandler =
    (count: number = 10) =>
    (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            let retryCount = 0;
            while (retryCount <= count) {
                try {
                    return await originalMethod.apply(this, args);
                } catch (error) {
                    retryCount += 1;
                    if (retryCount > count) {
                        throw new RpcException(error);
                    }
                    await waitForSeconds(0.5);
                }
            }
            return null;
        };
    };
