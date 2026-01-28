import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { QuotationsService } from "./quotations.service";

@Controller("quotations")
@UseGuards(JwtAuthGuard)
export class QuotationsController {
  constructor(private readonly service: QuotationsService) {}

  
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.service.createQuote(req.user, body);
  }

  @Patch(":id")
  async update(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: any
  ) {
    return this.service.updateQuote(req.user, id, body);
  }


  @Post(":id/send")
  async send(@Req() req: any, @Param("id") id: string) {
    return this.service.sendQuote(req.user, id);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.service.getAllQuotes(req.user);
  }

  @Get(":id")
  async findOne(@Req() req: any, @Param("id") id: string) {
    return this.service.getQuoteById(req.user, id);
  }

  
  @Delete(":id")
  async remove(@Req() req: any, @Param("id") id: string) {
    return this.service.deleteQuote(req.user, id);
  }
}
