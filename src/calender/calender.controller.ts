import {
  Controller,
  Get,
  Req,
  Query,
  UseGuards
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller()
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private prisma: PrismaService) {}

  @Get("/calendar")
  async getCalendar(@Req() req, @Query("date") date: string) {
    const companyId = req.user.companyId;

    const start = new Date(date + "T00:00:00");
const end = new Date(date + "T23:59:59");

    end.setHours(23, 59, 59);

    const jobs = await this.prisma.job.findMany({
      where: {
        companyId,
        quotation: {
          startAt: {
            gte: start,
            lte: end
          }
        }
      },
      include: {
        quotation: {
          include: { customer: true }
        }
      },
      orderBy: {
        quotation: { startAt: "asc" }
      }
    });

    return jobs.map(j => ({
        jobNumber: j.jobNumber,
  customerName: j.quotation?.customer?.fullName,
    fromAddress: j.quotation?.pickupAddress || "",
  toAddress: j.quotation?.dropoffAddress || "",
      id: j.id,

      time: j.quotation?.startAt
        ? j.quotation.startAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "—",
      endTime: j.quotation?.endAt
        ? j.quotation.endAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
      status: j.status,
      title:
        j.title ||
        `${j.quotation?.customer?.fullName || "Customer"} Move`,
      address: j.quotation?.pickupAddress || "",
      crew: j.quotation?.workers || 0,
      color:
        j.status === "PENDING"
          ? "#F4A261"
          : j.status === "COMPLETED"
          ? "#9CA3AF"
          : j.status === "CANCELLED"
          ? "#E76F51"
          : "#2A9D8F",
    }));
  }
}
