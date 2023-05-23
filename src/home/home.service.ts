import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { IUser } from 'src/decorators';
import { HomeResponseDto, CreateHomeDto, UpdateHomeDto } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';

export interface GetHomeFilters {
  propertyType?: PropertyType;
  price?: {
    lte?: number;
    gte?: number;
  };
  city?: string;
}

@Injectable()
export class HomeService {
  home = this.prismaService.home;
  image = this.prismaService.image;
  message = this.prismaService.message;

  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filters?: GetHomeFilters): Promise<HomeResponseDto[]> {
    const homes = await this.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        images: {
          select: {
            image_url: true,
          },
          take: 1,
        },
      },
      ...(filters && { where: filters }),
    });
    return homes.map((home) => {
      const formattedHome = new HomeResponseDto({
        ...home,
        image: home.images[0].image_url,
      });
      delete formattedHome.images;
      return formattedHome;
    });
  }

  async getHome(id: number): Promise<HomeResponseDto> {
    const home = await this.home.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        images: true,
        realtor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException('Home with that id does not exist');
    }

    return new HomeResponseDto(home);
  }

  async createHome(
    {
      address,
      city,
      numberOfBathrooms,
      numberOfBedrooms,
      landSize,
      images,
      price,
      propertyType,
    }: CreateHomeDto,
    userId: number,
  ): Promise<HomeResponseDto> {
    const home = await this.home.create({
      data: {
        address,
        city,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        land_size: landSize,
        propertyType,
        price,
        realtor_id: userId,
      },
    });

    const homeImages = images.map((image) => {
      return { ...image, home_id: home.id };
    });

    await this.image.createMany({
      data: homeImages,
    });

    return new HomeResponseDto(home);
  }

  async updateHome(id: number, body: UpdateHomeDto) {
    const home = await this.home.findUnique({
      where: {
        id,
      },
    });

    if (!home) {
      throw new NotFoundException('Home with that id does not exist');
    }

    const updatedHome = await this.home.update({
      where: {
        id,
      },
      data: body,
    });

    return new HomeResponseDto(updatedHome);
  }

  async deleteHome(id: number) {
    await this.home.delete({ where: { id } });
  }

  async getRealtorByHomeId(id: number): Promise<any> {
    const home = await this.home.findUnique({
      where: {
        id,
      },
      select: {
        realtor: {
          select: {
            name: true,
            id: true,
            email: true,
            userType: true,
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException('Home with that id does not exist');
    }

    return home.realtor;
  }

  async inquireHome(homeId: number, buyer: IUser, message: string) {
    const realtor = await this.getRealtorByHomeId(homeId);
    await this.message.create({
      data: {
        realtor_id: realtor.id,
        message: message,
        home_id: homeId,
        buyer_id: buyer.id,
      },
    });

    return {
      message: 'message sent',
    };
  }

  async getHomeMessages(homeId: number) {
    const home = await this.home.findUnique({
      where: {
        id: homeId,
      },
    });

    if (!home) {
      throw new NotFoundException('Home with that id does not exist');
    }

    return this.message.findMany({
      where: {
        home_id: homeId,
      },
      select: {
        home: {
          select: {
            id: true,
            address: true,
            city: true,
            price: true,
            propertyType: true,
          },
        },
        buyer: {
          select: {
            name: true,
            email: true,
            phone_number: true,
          },
        },
      },
    });
  }
}
