import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";

import { AuthController } from "./auth/auth1/auth.controller";
import { DashboardController } from "./dashboard/dashboard.controller";

import { QuotationsModule } from "./quotations/quotations.module";
import { AuthModule } from "./auth/auth1/auth.module";
import { PublicModule } from "./modules/public/public.module";
import { CustomersModule } from "./customers/customers.module";
import { CalendarModule } from "./calender/calender.module";
import { JobModule } from "./jobs/job.module";
import { EmployeesModule } from "./employees/employees.module";
import { PrismaModule } from "../prisma/prisma.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    PrismaModule,

    // ⏰ GLOBAL CRON (ONLY HERE)
    ScheduleModule.forRoot(),

    AuthModule,
    PublicModule,
    JobModule,
    EmployeesModule,
    NotificationsModule, // 🔔🔥 ADD THIS

    CustomersModule,
    QuotationsModule,
    CalendarModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "7d" },
    }),
  ],
  controllers: [
    AuthController,
    DashboardController,
  ],
})
export class AppModule {}
