import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseEnumPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ProductKeyDto, SignInDto, SignUpDto } from 'src/dto';
import { ApiTags } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { compare } from 'bcryptjs';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup/:userType')
  async signup(
    @Body() body: SignUpDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (userType !== UserType.BUYER && userType !== UserType.USER) {
      if (!body.productKey) {
        throw new UnauthorizedException('Please provide a product key');
      }
      const productKey = await this.authService.generateProductKey({
        email: body.email,
        userType,
      });
      const isValidProductKey = await compare(productKey, body.productKey);
      if (!isValidProductKey) {
        throw new UnauthorizedException('Invalid product key');
      }
    }
    if (userType === UserType.BUYER || userType === UserType.USER) {
      delete body.productKey;
    }
    return this.authService.signUp(body, userType);
  }

  @HttpCode(200)
  @Post('signin')
  async signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body);
  }

  @Post('productKey')
  async generateProductKey(@Body() body: ProductKeyDto) {
    return this.authService.generateProductKey(body);
  }
}
