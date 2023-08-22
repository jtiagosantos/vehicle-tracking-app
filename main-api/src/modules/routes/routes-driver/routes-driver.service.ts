import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { CreateOrUpdateRoutesDriverDto } from '../dto/create-or-update-routes-driver.dto';

@Injectable()
export class RoutesDriverService {
  constructor(private prismaService: PrismaService) {}

  async createOrUpdate({ routeId, lat, lng }: CreateOrUpdateRoutesDriverDto) {
    /* const countRoutesDriver = await this.prismaService.routeDriver.count({
      where: {
        routeId: createOrUpdateRoutesDriverDto.routeId,
      },
    }); */

    return this.prismaService.routeDriver.upsert({
      where: {
        routeId,
      },
      create: {
        routeId,
        points: {
          set: {
            location: {
              lat,
              lng,
            },
          },
        },
      },
      update: {
        points: {
          push: {
            location: {
              lat,
              lng,
            },
          },
        },
      },
      include: {
        route: true,
      },
    });
  }
}
