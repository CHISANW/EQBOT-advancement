import { Injectable } from '@nestjs/common';
import {
    DiskHealthIndicator,
    HealthCheckResult,
    HealthCheckService,
    HealthIndicator,
    HealthIndicatorResult,
    MemoryHealthIndicator,
    MicroserviceHealthIndicator,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Config } from '../../config/environment/config';
import { Transport } from '@nestjs/microservices';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HEALTHCHECK } from './constants/health-check.constants';

@Injectable()
export class HealthService extends HealthIndicator {
    private RABBITMQ = Config.getEnvironment().RABBITMQ;

    constructor(
        private health: HealthCheckService,
        private memory: MemoryHealthIndicator,
        private db: TypeOrmHealthIndicator,
        private microservice: MicroserviceHealthIndicator,
        @InjectDataSource('connection1')
        private readonly connection1: DataSource,
        private readonly disk: DiskHealthIndicator,
    ) {
        super();
    }

    private healthCheckServices = {
        heap: async () => this.memory.checkHeap('heap', HEALTHCHECK.HEAP_THRESHOLD),
        rss: async () => this.memory.checkRSS('rss', HEALTHCHECK.RSS_THRESHOLD),
        disk: async () =>
            this.disk.checkStorage('storage', {
                path: '/',
                threshold: HEALTHCHECK.DISK_THRESHOLD,
            }),
        database1: async () => this.db.pingCheck('database1', { connection: this.connection1 }),
        rabbitMQ: async () =>
            this.microservice.pingCheck('rabbitMQ', {
                transport: Transport.RMQ,
                options: {
                    urls: [
                        `${this.RABBITMQ.PROTOCOL}://${this.RABBITMQ.ID}:${this.RABBITMQ.PASSWORD}@${this.RABBITMQ.HOST}:${this.RABBITMQ.PORT}`,
                    ],
                },
            }),
    };

    async checkAllSystemsHealth(): Promise<HealthCheckResult> {
        const result = await this.health.check([
            this.healthCheckServices.heap,
            this.healthCheckServices.rss,
            this.healthCheckServices.disk,
            this.healthCheckServices.database1,
            this.healthCheckServices.rabbitMQ,
        ]);

        return this.resultHeader(result);
    }

    async checkExternalSystemsHealth(): Promise<HealthCheckResult> {
        const result = await this.health.check([
            this.healthCheckServices.database1,
            this.healthCheckServices.rabbitMQ,
        ]);
        return this.resultHeader(result);
    }

    resultHeader(result: HealthCheckResult): HealthCheckResult {
        const mockResult = {};

        Object.keys(result.details).forEach((key) => {
            const isNumericKey = !Number.isNaN(parseInt(key, 10));

            // 숫자로 된 키 처리
            if (isNumericKey) {
                const nestedKey = Object.keys(result.details[key])[0];
                mockResult[nestedKey] = result.details[key][nestedKey];
            }

            // 문자로 된 키 처리
            if (!isNumericKey) {
                mockResult[key] = result.details[key];
            }
        });

        Object.assign(result, {
            details: mockResult,
            info: mockResult,
        });
        return result;
    }
}
