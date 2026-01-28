import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { randomUUID } from "crypto";
import * as nodemailer from "nodemailer";
import Twilio from "twilio";

@Injectable()
export class QuotationsService {
  private mailer?: nodemailer.Transporter;
  private twilio?: any;

  constructor(private prisma: PrismaService) {
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      this.mailer = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    if (
      process.env.TWILIO_SID &&
      process.env.TWILIO_TOKEN
    ) {
      this.twilio = Twilio(
        process.env.TWILIO_SID,
        process.env.TWILIO_TOKEN
      );
    }
  }

  
  async createQuote(user: any, data: any) {
    if (!data.customerId)
      throw new BadRequestException("Customer is required");

    const last = await this.prisma.quotation.findFirst({
      where: { companyId: user.companyId },
      orderBy: { quoteNumber: "desc" },
    });

    const nextQuoteNumber = last ? last.quoteNumber + 1 : 1001;

    return this.prisma.quotation.create({
      data: {
        quoteNumber: nextQuoteNumber,
        status: "DRAFT",

        customerId: data.customerId,
movingDate: data.movingDate
  ? new Date(data.movingDate)
  : null,
startTime: data.startTime || null,

        serviceType: data.serviceType,

        companyId: user.companyId,
        createdById: user.id,

        workers: 1,
        trucks: 1,
        pricingMethod: "HOURLY",
        total: 0,
      },
    });
  }

async updateQuote(user: any, id: string, data: any) {
  const quote = await this.prisma.quotation.findFirst({
    where: { id, companyId: user.companyId },
  });

  if (!quote) throw new NotFoundException("Quotation not found");
  if (quote.status !== "DRAFT")
    throw new BadRequestException("Only draft quotations can be edited");

  const safe = (v: any) =>
    typeof v === "number" && !isNaN(v) ? v : undefined;


  const finalMovingDate = data.movingDate
    ? new Date(data.movingDate)
    : quote.movingDate;

  const finalStartTime = data.startTime ?? quote.startTime;

  const finalEstimatedHours =
    data.estimatedHours ?? quote.estimatedHours;

  let startAtUpdate: Date | undefined = undefined;
  let endAtUpdate: Date | undefined = undefined;

if (
  finalMovingDate &&
  finalStartTime &&
  finalEstimatedHours &&
  finalEstimatedHours > 0
) {
  const [hh, mm] = finalStartTime.split(":");

const [year, month, day] = finalMovingDate
  .toISOString()
  .slice(0, 10)
  .split("-")
  .map(Number);

const startAt = new Date(
  year,
  month - 1,
  day,
  Number(hh),
  Number(mm),
  0,
  0
);



  if (!isNaN(startAt.getTime())) {
const endAt = new Date(
  startAt.getTime() +
    finalEstimatedHours * 60 * 60 * 1000
);



    startAtUpdate = startAt;
    endAtUpdate = endAt;
  }
}


  return this.prisma.quotation.update({
    where: { id },
    data: {
      movingDate: data.movingDate
        ? new Date(data.movingDate)
        : undefined,
startTime:
  data.startTime !== undefined
    ? data.startTime
    : undefined,

      ...(startAtUpdate && { startAt: startAtUpdate }),
      ...(endAtUpdate && { endAt: endAtUpdate }),

      serviceType: data.serviceType,
      pricingMethod: data.pricingMethod,

      workers: safe(data.workers),
      trucks: safe(data.trucks),
      truckSize: data.truckSize,

      hourlyRate: safe(data.hourlyRate),
      estimatedHours: safe(data.estimatedHours),
      fixedPrice: safe(data.fixedPrice),

      travelCost: safe(data.travelCost),
      materialsCost: safe(data.materialsCost),
      otherFees: safe(data.otherFees),
      discount: safe(data.discount),

      taxTPS: safe(data.taxTPS),
      taxTVQ: safe(data.taxTVQ),
      total: safe(data.total),

      estimatedVolumeCft: safe(data.estimatedVolumeCft),
      estimatedWeightLbs: safe(data.estimatedWeightLbs),
      inventoryNotes: data.inventoryNotes,

      pickupAddress: data.pickupAddress,
      pickupUnit: data.pickupUnit,
pickupFloor:
  data.pickupFloor !== undefined ? data.pickupFloor : undefined,

dropoffFloor:
  data.dropoffFloor !== undefined ? data.dropoffFloor : undefined,
      pickupElevator: data.pickupElevator,
      pickupLoadingDock: data.pickupLoadingDock,
      parkingDifficulty: data.parkingDifficulty,
      walkingDistance: safe(data.walkingDistance),
      stairsWidth: data.stairsWidth,
      pickupAccessNotes: data.pickupAccessNotes,

      dropoffAddress: data.dropoffAddress,
      dropoffUnit: data.dropoffUnit,
      dropoffElevator: data.dropoffElevator,
      dropoffLoadingDock: data.dropoffLoadingDock,
      dropoffParkingDifficulty: data.dropoffParkingDifficulty,
      dropoffWalkingDistance: safe(data.dropoffWalkingDistance),
      dropoffStairsWidth: data.dropoffStairsWidth,
      dropoffAccessNotes: data.dropoffAccessNotes,

      termsText: data.termsText,
      internalNotes: data.internalNotes,
      validityDays: safe(data.validityDays),

      notes: data.notes,
    },
  });
}

async sendQuote(user: any, id: string) {
  const quote = await this.prisma.quotation.findFirst({
    where: { id, companyId: user.companyId },
    include: { customer: true, company: true },
  });

  if (!quote) throw new NotFoundException("Quotation not found");
  if (quote.status !== "DRAFT")
    throw new BadRequestException("Only draft quotations can be sent");

  if (!quote.validityDays)
    throw new BadRequestException("Validity period missing");

  if (!quote.startAt || !quote.endAt) {
    throw new BadRequestException(
      "Set moving date, start time and estimated hours before sending quotation"
    );
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + quote.validityDays);

  const token = randomUUID();
  const publicLink = `${process.env.APP_PUBLIC_URL}/public/quotation/${token}`;

  const updated = await this.prisma.quotation.update({
    where: { id },
    data: {
      status: "SENT",
      publicToken: token,
      sentAt: new Date(),
      expiresAt
    },
  });

  const lastJob = await this.prisma.job.findFirst({
    where: { companyId: user.companyId },
    orderBy: { jobNumber: "desc" },
  });
  const nextJobNumber = lastJob ? lastJob.jobNumber + 1 : 1001;

  await this.prisma.job.create({
    data: {
      jobNumber: nextJobNumber,
      title: `${quote.customer?.fullName || "Customer"} Move`,
      status: "PENDING",
      companyId: user.companyId,
      quotationId: updated.id,   
    }
  });

  if (this.mailer && quote.customer?.email) {
    await this.mailer.sendMail({
      to: quote.customer.email,
      subject: `Quotation #${updated.quoteNumber}`,
      html: `
        <p>Hello ${quote.customer.fullName},</p>
        <p>Your moving quotation is ready.</p>
        <p><a href="${publicLink}">View Quotation</a></p>
        <p>Valid until ${expiresAt.toDateString()}</p>
      `,
    });
  }

  return {
    success: true,
    quoteNumber: updated.quoteNumber,
    link: publicLink,
    expiresAt,
  };
}

  async getAllQuotes(user: any) {
    return this.prisma.quotation.findMany({
      where: { companyId: user.companyId },
      orderBy: { updatedAt: "desc" },
      include: {
        customer: {
          select: {
            fullName: true,
            phone: true,
            pickupAddress: true,
            dropoffAddress: true,
          },
        },
      },
    });
  }
  async getQuoteById(user: any, id: string) {
    const quote = await this.prisma.quotation.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        customer: true,
        createdBy: {
          select: { fullName: true, email: true },
        },
      },
    });

    if (!quote) throw new NotFoundException("Quotation not found");
    return quote;
  }
  async deleteQuote(user: any, id: string) {
    const quote = await this.prisma.quotation.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!quote) throw new NotFoundException("Quotation not found");

    await this.prisma.quotation.delete({ where: { id } });
    return { success: true };
  }
}
