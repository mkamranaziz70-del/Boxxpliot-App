import { Controller, Get, Req } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get("owner")
  async ownerDashboard(@Req() req: any) {
  
    const user = await this.prisma.user.findFirst({
      where: { role: "OWNER" },
      include: { company: true },
      orderBy: { createdAt: "desc" },
    });

    if (!user) {
      return {
        user: { fullName: "" },
        stats: { moves: 0, pending: 0, cancelled: 0 },
        quotationsCount: 0,
        draftCount: 0,
        upcoming: [],
      };
    }

    const quotationsCount = await this.prisma.quotation.count({
      where: {
        companyId: user.companyId,
      },
    });

    const draftCount = await this.prisma.quotation.count({
      where: {
        companyId: user.companyId,
        status: "DRAFT",
      },
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
      },

      stats: {
        moves: 0,
        pending: 0,
        cancelled: 0,
      },

      quotationsCount,
      draftCount,

      upcoming: [],
    };
  }
}
