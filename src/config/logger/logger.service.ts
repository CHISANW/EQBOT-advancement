import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { ClsService } from 'nestjs-cls';

import DailyRotateFile from 'winston-daily-rotate-file';
import { Config } from '../environment/config';
import { EXPECTED_ERROR_LOG } from '../constants/constants';

@Injectable()
export class Logger implements LoggerService {
    constructor (private readonly clsService: ClsService) {}

    logger = winston.createLogger({
        level: Config.getEnvironment().NODE_ENV === 'production' ? 'info' : 'debug',
        format: winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss Z',
            }),
            winston.format.splat(),
            Config.getEnvironment().NODE_ENV === 'production'
                ? winston.format.uncolorize()
                : winston.format.colorize(),

            winston.format.printf(({
                timestamp, level, message, ...metadata
            }) => {
                const requestId = this.clsService.getId();
                const transformedMessage = this.stringifyData(message);
                const transformedMetadata = this.stringifyData(metadata);
                return `${timestamp} : [${requestId ?? ''}] : ${level} : ${transformedMessage} : ${transformedMetadata}`;
            }),
        ),
        transports: [
            new winston.transports.Console({
                stderrLevels: ['error'],
            }),
            new DailyRotateFile({
                level: 'error',
                format: winston.format.uncolorize(),
                filename: '%DATE%.error.log',
                dirname: 'logs/error',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '30d', // 30일치 로그 파일 저장
                auditFile: 'logs/error/audit.json',
            }),
        ],
    });

    stringifyData (data: Record<string, any>): string {
        if (Object.keys(data).every((key) => !Number.isNaN(parseInt(key, 10)))) {
            return Object.values(data).join('');
        }
        return JSON.stringify(data);
    }

    log (message: any, ...optionalParams: any[]) {
        if (Config.getEnvironment().NODE_ENV === 'test') {
            this.logger.log('info', message, ...optionalParams);
        }
    }

    info (message: any, ...optionalParams: any[]) {
        this.logger.info(message, ...optionalParams);
    }

    error (message: any, ...optionalParams: any[]) {
        this.logger.error(message, ...optionalParams);
    }

    warn (message: any, ...optionalParams: any[]) {
        this.logger.warn(message, ...optionalParams);
    }

    debug (message: any, ...optionalParams: any[]) {
        this.logger.debug(message, ...optionalParams);
    }

    generateErrorLog (data: {
        source?: {
            file?: string;
            function?: string;
        };
        context: Record<string, any>;
        message: string;
    }) {
        const { stack } = new Error();
        const stackArray = stack?.split('\n') || [];
        const callerLine = stackArray[2] || '';
        const functionNameMatch = callerLine.match(/at (\S+) \(/);
        const fileNameMatch = callerLine.match(/\/([a-zA-Z0-9._-]+\.ts)/);

        const errorLog = {
            message: data.message,
            metadata: {
                service: Config.getEnvironment().SERVICE_NAME,
                source: {
                    file: fileNameMatch ? fileNameMatch[1] : data.source?.file || 'unknown',
                    function: functionNameMatch
                        ? functionNameMatch[1].split('.').pop()
                        : data.source?.function || 'unknown',
                },
                context: data.context,
            },
        };
        this.clsService.set(EXPECTED_ERROR_LOG, errorLog);
        return errorLog;
    }
}
