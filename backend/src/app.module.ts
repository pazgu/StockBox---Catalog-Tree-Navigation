import { Module } from '@nestjs/common';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { ProductsModule } from './products/products.module';
import { PermissionsController } from './permissions/permissions.controller';
import { PermissionsModule } from './permissions/permissions.module';
import { GroupsController } from './groups/groups.controller';
import { GroupsService } from './groups/groups.service';
import { GroupsModule } from './groups/groups.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonController } from './common/common.controller';
import { CommonService } from './common/common.service';
import { CommonModule } from './common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
    UsersModule,
  ],
  controllers: [
    ProductsController,
    PermissionsController,
    GroupsController,
    CommonController,
  ],
  providers: [ProductsService, GroupsService, CommonService],
})
export class AppModule {}
