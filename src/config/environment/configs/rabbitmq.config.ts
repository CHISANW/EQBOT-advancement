import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class RabbitMQConfig {
  @IsString()
  PROTOCOL: string;

  @IsString()
  HOST: string;

  @IsString()
  ID: string;

  @IsString()
  PASSWORD: string;

  @IsString()
  ENVIRONMENT: string;

  @Type(() => Number)
  @IsNumber()
  PORT: number;

  @Type(() => Number)
  @IsNumber()
  RETRY_COUNT = 10;

  @IsString()
  QUEUE: string;

  @IsString()
  EXCHANGE: string;

  @IsString()
  ROUTING_KEY: string;
}
