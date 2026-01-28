import { Module } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { PublicQuotationController } from "../../public-quotation/public-quotation.controller";
import { PublicSignController } from "../../public-quotation/public-signin.controller";

@Module({
  controllers: [PublicQuotationController,PublicSignController], 
  providers: [PrismaService],
})
export class PublicModule {}
