import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { PermissionsController } from './permissions/permissions.controller';
import { PermissionsModule } from './permissions/permissions.module';
import { GroupsModule } from './groups/groups.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonController } from './common/common.controller';
import { CommonService } from './common/common.service';
import { CommonModule } from './common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AboutModule } from './about/about.module';

import { join } from 'path';
import { existsSync } from 'fs';
import { SearchModule } from './search/search.module';

const envPath = existsSync(join(process.cwd(), '.env'))
  ? join(process.cwd(), '.env')
  : join(process.cwd(), 'backend', '.env');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envPath,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DB_CONNECTION'),
      }),
    }),
    ProductsModule,
    PermissionsModule,
    GroupsModule,
    CategoriesModule,
    CommonModule,
    AuthModule,
    UsersModule,
    AboutModule,
    SearchModule,
  ],
  controllers: [PermissionsController, CommonController],
  providers: [CommonService],
})
export class AppModule {}
