import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { NotificationService } from "./notification.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("Notifications (SMS & Email)")
@ApiBearerAuth()
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post("send-sms")
  @ApiOperation({
    summary: "Send direct SMS notification via Sri Lanka SMS Gateway",
  })
  async sendSms(@Body() body: { toPhone: string; message: string }) {
    const success = await this.notificationService.sendSms(
      body.toPhone,
      body.message,
    );
    return { success, message: "SMS request queued." };
  }
}
