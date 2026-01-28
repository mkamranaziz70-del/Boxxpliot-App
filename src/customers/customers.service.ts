import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, data: any) {
    return this.prisma.customer.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email ?? null,

        pickupAddress: data.pickupAddress,
        dropoffAddress: data.dropoffAddress,
        floor: data.floor,
        elevator: data.elevator,
        parking: data.parking,
        notes: data.notes ?? null,

        companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
