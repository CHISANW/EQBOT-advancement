import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { Config } from '../../config/environment/config';
import { Logger } from '../../config/logger/logger.service';
import {
    EXPECTED_ERROR_LOG,
    UNEXPECTED_ERROR_LOG,
} from 'src/config/constants/constants';

export class LoggerMiddleware implements NestMiddleware {
    constructor (
    private readonly logger: Logger,
    private readonly clsService: ClsService,
    ) {}

    use (req: Request, res: Response, next: NextFunction): void {
        const start = Date.now();
        res.on('finish', () => {
            const getIpFormat = Config.getEnvironment().NODE_ENV === 'development'
                ? `${req.ip} - `
                : '';
            const { method, originalUrl } = req;
            const { statusCode } = res;
            const duration = Date.now() - start;
            const responseMessage = `${getIpFormat}${method} ${originalUrl} ${statusCode} - ${duration}ms`;

            // 예외처리한 에러 중 ApiErrorLog를 남긴 경우 입니다.
            if (this.clsService.get(EXPECTED_ERROR_LOG)) {
                const ApiErrorLog = this.clsService.get(EXPECTED_ERROR_LOG);
                this.logger.info(
                    `${responseMessage}\n${ApiErrorLog.message}`,
                    `${JSON.stringify(ApiErrorLog.metadata)}`,
                );
                return;
            }

            // 예외처리하지 못한 예상치 못한 에러 입니다. UnexceptedErrorLog는 ExceptionFilter에서 저장합니다.
            if (this.clsService.get(UNEXPECTED_ERROR_LOG)) {
                const UnexpectedErrorLog = this.clsService.get(UNEXPECTED_ERROR_LOG);
                this.logger.error(`${responseMessage}\n${UnexpectedErrorLog.stack}`);
                return;
            }

            // 예외처리한 에러 중 ApiErrorLog를 남기지 않은 경우 입니다.
            if (statusCode >= 400) {
                this.logger.info(`${responseMessage} - message: ${res.statusMessage}`);
                return;
            }
            this.logger.info(`${responseMessage}`);
        });
        next();
    }
}
