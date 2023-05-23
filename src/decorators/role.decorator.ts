import { SetMetadata } from '@nestjs/common';
import { UserType } from '@prisma/client';

export const Roles = (...role: UserType[]) => SetMetadata('roles', role);
