import { Module } from "@nestjs/common";
import { PdfService } from "./pdf.service";
import { PdfController } from "./pdf.controller";
import { PrismaService } from "../../common/prisma/prisma.service";

@Module({
  controllers: [PdfController],
  providers: [PdfService, PrismaService],
  exports: [PdfService],
})
export class PdfModule {}
