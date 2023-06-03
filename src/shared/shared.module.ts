import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';

@Module({
  imports: [PrismaModule, JwtModule, ConfigModule],
  exports: [
    PrismaModule,
    ConfigModule.forRoot({
      load: [configuration],
      cache: true,
      isGlobal: true,
    }),
    JwtModule.register({
      secret: configuration().tokenExpires,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRES },
    }),
  ],
})
export class SharedModule {}
