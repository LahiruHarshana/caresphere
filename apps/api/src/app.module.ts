import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CaregiversModule } from './caregivers/caregivers.module';
import { BookingsModule } from './bookings/bookings.module';
import { MatchingModule } from './matching/matching.module';
import { VaultModule } from './vault/vault.module';
import { ChatModule } from './chat/chat.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { InvoicesModule } from './invoices/invoices.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [AuthModule, UsersModule, CaregiversModule, BookingsModule, MatchingModule, VaultModule, ChatModule, PaymentsModule, AdminModule, InvoicesModule, NotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
