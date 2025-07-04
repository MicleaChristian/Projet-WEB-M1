import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const testConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'document_management_test',
  entities: [join(__dirname, '../src/**/*.entity.{ts,js}')],
  synchronize: true,
  ssl: false,
}; 