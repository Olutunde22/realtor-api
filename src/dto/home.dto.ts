// This is if we are using camel case in the db so we want to transform the response

import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class HomeResponseDto {
  id: number;
  address: string;

  @Exclude()
  number_of_bedrooms: number;

  @Expose({ name: 'numberOfBedrooms' })
  numberOfBedrooms() {
    return this.number_of_bedrooms;
  }

  @Exclude()
  number_of_bathrooms: number;

  @Expose({ name: 'listedDate' })
  numberOfBathrooms() {
    return this.number_of_bathrooms;
  }

  city: string;

  image: string;

  @Exclude()
  listed_date: Date;

  images: {
    image_url: string;
  }[];

  @Expose({ name: 'listedDate' })
  listedDate() {
    return this.listed_date;
  }

  price: number;

  @Exclude()
  land_size: number;

  @Expose({ name: 'landSize' })
  landSize() {
    return this.land_size;
  }

  propertyType: PropertyType;

  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Exclude()
  realtor_id: number;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}

class ImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  image_url: string;
}

export class CreateHomeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  numberOfBedrooms: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  numberOfBathrooms: number;

  @ApiProperty()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  landSize: number;

  @ApiProperty()
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images: ImageDto[];
}

export class UpdateHomeDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfBedrooms?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfBathrooms?: number;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  city?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  landSize?: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;
}

export class InquireDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}
