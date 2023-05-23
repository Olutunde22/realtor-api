import { Test, TestingModule } from '@nestjs/testing';
import { HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue([]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getHomes', async () => {
    const mockPrismaFindMany = jest.fn().mockReturnValue([]);
    jest
      .spyOn(prismaService.home, 'findMany')
      .mockImplementation(mockPrismaFindMany);

    await service.getHomes();

    expect(mockPrismaFindMany).toBeCalledTimes(1);
  });
});
