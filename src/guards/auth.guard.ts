import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verify } from 'jsonwebtoken';
import { IUser } from 'src/decorators';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles?.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request?.headers?.authorization?.split('Bearer ')[1];
    try {
      const payload = (await verify(token, process.env.TOKEN_SECRET)) as IUser;

      const user = await this.prismaService.user.findUnique({
        where: {
          id: payload?.id,
        },
      });

      if (!user) {
        return false;
      }

      if (roles.includes(user.userType)) return true;

      return false;

      return true;
    } catch (error) {
      return false;
    }
  }
}
