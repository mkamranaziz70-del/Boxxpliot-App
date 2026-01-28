import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  NotFoundException,
  Body,
  Res,
} from "@nestjs/common";

import type { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { JobStatus, QuoteStatus } from "@prisma/client";

@Controller("public/quotation")
export class PublicSignController {
  constructor(private prisma: PrismaService) {}
@Post(":token/sign")
async submitSignature(
  @Param("token") token: string,
  @Body() body: { signature: string },
  @Req() req: any
) {
  try {
    const quote = await this.prisma.quotation.findFirst({
      where: {
        publicToken: token,
        status: "SENT",
        expiresAt: { gt: new Date() },
      },
      include: { customer: true },
    });

    if (!quote || !quote.customer) {
      throw new NotFoundException("Invalid or expired quotation");
    }

    if (!quote.startAt || !quote.endAt) {
      throw new NotFoundException("Move date/time not set on quotation");
    }

    const updated = await this.prisma.quotation.update({
      where: { id: quote.id },
      data: {
        status: "SIGNED",
        signedBy: quote.customer.fullName,
        signedAt: new Date(),
        signature: body.signature,
      },
    });

    const existingJob = await this.prisma.job.findFirst({
      where: { quotationId: updated.id }
    });
 if (!existingJob) {
      const lastJob = await this.prisma.job.findFirst({
        where: { companyId: updated.companyId },
        orderBy: { jobNumber: "desc" },
      });

      const nextJobNumber = lastJob ? lastJob.jobNumber + 1 : 1001;

      await this.prisma.job.create({
        data: {
          quotationId: updated.id,
          companyId: updated.companyId,
          jobNumber: nextJobNumber,
          status: JobStatus.PENDING,
        },
      });
    }

    return {
      success: true,
      message: "Quotation signed successfully",
    };
  } catch (error) {
    console.error("SIGN ERROR:", error);
    throw error;
  }
}


  @Get(":token/sign")
  async signPage(
    @Param("token") token: string,
    @Res() res: Response
  ): Promise<void> {

    const quote = await this.prisma.quotation.findFirst({
      where: {
        publicToken: token,
        status: "SENT",
        expiresAt: { gt: new Date() },
      },
      include: { customer: true },
    });

    if (!quote || !quote.customer) {
      throw new NotFoundException("Invalid or expired quotation");
    }

    res.status(200);
    res.type("html");

    res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sign Quotation</title>

<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, Arial;
  background: #f6f6f6;
  padding: 16px;
  margin: 0;
}
.card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
}
.canvas-box {
  border: 2px dashed #ddd;
  border-radius: 12px;
  height: 180px;
  margin-top: 16px;
  position: relative;
}
canvas {
  width: 100%;
  height: 100%;
}
.clear {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f1c27d;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
}
.btn {
  margin-top: 20px;
  background: #d8a15d;
  color: #fff;
  padding: 16px;
  text-align: center;
  border-radius: 12px;
  font-weight: 800;
}
.small {
  font-size: 12px;
  color: #777;
  text-align: center;
  margin-top: 10px;
}
</style>
</head>

<body>

<div class="card">
  <div class="small">Ref: #Q-${quote.quoteNumber}</div>

  <h3>
    I '${quote.customer.fullName}' authorize this move
  </h3>

  <p class="small">
    Please read and sign below to accept the quotation.
  </p>

  <div class="canvas-box">
    <button class="clear" onclick="clearCanvas()">Clear</button>
    <canvas id="sig"></canvas>
  </div>

  <div class="btn" onclick="submitSignature()">
    Confirm Signature
  </div>

  <div class="small">
    Securely signed via BOXXPILOT
  </div>
</div>

<script>
const canvas = document.getElementById("sig");
const ctx = canvas.getContext("2d");

let drawing = false;

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

canvas.addEventListener("mousedown", () => {
  drawing = true;
  ctx.beginPath();
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function submitSignature() {
  const signature = canvas.toDataURL("image/png");

  fetch(window.location.pathname, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ signature }),
  })
    .then(res => res.json())
    .then(() => {
      alert("Quotation signed successfully ✅");
      window.location.href = "/";
    })
    .catch(() => {
      alert("Failed to sign quotation");
    });
}

</script>

</body>
</html>
`);
  }
}
