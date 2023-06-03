import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

export class UserInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const token = request?.headers?.authorization?.split('Bearer ')[1];
    if (token) {
      const user = this.jwtService.decode(token);
      request.user = user;
    }
    return next.handle();
  }
}
