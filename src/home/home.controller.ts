import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { HomeService } from './home.service';
import {
  CreateHomeDto,
  HomeResponseDto,
  InquireDto,
  UpdateHomeDto,
} from 'src/dto';
import { PropertyType, UserType } from '@prisma/client';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { IUser, User } from 'src/decorators';
import { Roles } from 'src/decorators/role.decorator';

@ApiTags('Home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('/')
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: String })
  @ApiQuery({ name: 'maxPrice', required: false, type: String })
  @ApiQuery({ name: 'propertyType', required: false, type: String })
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') propertyType?: PropertyType,
    // Todo add pagination
  ): Promise<HomeResponseDto[]> {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;

    const filters = {
      ...(city && { city }),
      ...(price && { price }),
      ...(propertyType && { propertyType }),
    };
    return this.homeService.getHomes(filters);
  }

  @Get(':id')
  async getHome(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HomeResponseDto> {
    return this.homeService.getHome(id);
  }

  @Roles(UserType.ADMIN, UserType.REALTOR)
  @Post()
  async createHome(@Body() body: CreateHomeDto, @User() user: IUser) {
    return this.homeService.createHome(body, user.id);
  }

  @Roles(UserType.ADMIN, UserType.REALTOR)
  @Put(':id')
  async updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
    @User() user: IUser,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);

    if (realtor.id !== user?.id) {
      throw new UnauthorizedException(
        'You are not authorized to update this home',
      );
    }
    return this.homeService.updateHome(id, body);
  }

  @Roles(UserType.ADMIN, UserType.REALTOR)
  @Delete(':id')
  async deleteHome(@Param('id', ParseIntPipe) id: number, @User() user: IUser) {
    const realtor = await this.homeService.getRealtorByHomeId(id);

    if (realtor.id !== user?.id) {
      throw new UnauthorizedException(
        'You are not authorized to delete this home',
      );
    }
    return this.homeService.deleteHome(id);
  }

  @Roles(UserType.BUYER)
  @Post('/:id/inquire')
  async inquireHome(
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: IUser,
    @Body() { message }: InquireDto,
  ) {
    return this.homeService.inquireHome(homeId, user, message);
  }

  @Roles(UserType.REALTOR)
  @Post('/:id/messages')
  async getHomeMessages(
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: IUser,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(homeId);

    if (realtor.id !== user?.id) {
      throw new UnauthorizedException(
        'You are not authorized to get this home messages',
      );
    }
    return this.homeService.getHomeMessages(homeId);
  }
}
