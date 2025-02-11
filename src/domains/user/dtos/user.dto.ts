import { IsInt, IsObject, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
  @IsInt()
  @Type(() => Number)
  user_id: number;

  @IsString()
  address: string;

  @IsString()
  private_key: string;

  @IsObject()
  created_at: Date;
}
