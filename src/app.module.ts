import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import {
  TimeoutInterceptor,
  TransformInterceptor,
  UserInterceptor,
} from './interceptors';
import { AuthGuard } from './guards';
import { SharedModule } from './shared/shared.module';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: UserInterceptor,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [UserModule, AuthModule, HomeModule, SharedModule],
})
export class AppModule {}
