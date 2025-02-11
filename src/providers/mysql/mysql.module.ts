import { Module } from '@nestjs/common';
import { TypeOrmModules } from './constants/mysql.constants';

@Module({
    imports: [...TypeOrmModules],
    exports: [...TypeOrmModules],
})
export class MysqlModule {}
