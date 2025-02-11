import { IsString } from 'class-validator';

export class MailConfig {
  @IsString()
  name: string;

  @IsString()
  transport: string;
}
