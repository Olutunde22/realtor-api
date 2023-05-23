import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserType } from '@prisma/client';
import { ProductKeyDto, SignInDto, SignUpDto } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  user = this.prismaService.user;
  constructor(private readonly prismaService: PrismaService) {}

  async signUp(body: SignUpDto, userType: UserType) {
    const userExists = await this.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (userExists) {
      throw new ConflictException('Email already exists');
    }

    const createdUser = await this.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone_number: body.phoneNumber,
        password: await this.hashPassword(body.password),
        userType,
      },
    });

    return {
      token: await this.generateToken({
        id: createdUser.id,
        name: createdUser.name,
      }),
    };
  }

  async signIn(body: SignInDto) {
    const userExists = await this.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!userExists) {
      throw new NotFoundException('Invalid email/password');
    }

    if (!(await this.verifyPassword(body.password, userExists.password))) {
      throw new NotFoundException('Invalid email/password');
    }

    return {
      token: await this.generateToken({
        id: userExists.id,
        name: userExists.name,
      }),
    };
  }
  async generateProductKey({ email, userType }: ProductKeyDto) {
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
    return hash(string, 10);
  }

  private async hashPassword(password: string) {
    return hash(password, 10);
  }

  private async verifyPassword(password: string, hashedPassword: string) {
    return compare(password, hashedPassword);
  }

  private async generateToken(payload: Pick<User, 'id' | 'name'>) {
    return sign(payload, process.env.TOKEN_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRES,
    });
  }
}
