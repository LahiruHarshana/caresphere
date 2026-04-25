import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { baseTemplate } from './templates/base.template';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
    private config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get('SMTP_PORT'),
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async sendNotification(userId: string, type: string, title: string, body: string, htmlContent?: string) {
    // 1. Save to DB
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
      },
    });

    // 2. Real-time delivery
    this.gateway.sendNotification(userId, notification);

    // 3. Email delivery
    this.sendEmail(userId, title, body, htmlContent).catch((err) => {
      this.logger.error(`Failed to send email to user ${userId}: ${err.message}`);
    });

    return notification;
  }

  private async sendEmail(userId: string, title: string, body: string, htmlContent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || !user.email) return;

    try {
      await this.transporter.sendMail({
        from: `"CareSphere" <${this.config.get('SMTP_USER')}>`,
        to: user.email,
        subject: title,
        text: body,
        html: htmlContent || baseTemplate(`<h2>${title}</h2><p>${body}</p>`),
      });
    } catch (error) {
        this.logger.error(`Error sending email: ${error}`);
    }
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
