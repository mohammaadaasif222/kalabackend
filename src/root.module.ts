import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { TalentModule } from './talent/talent.module';
import { SocialsModule } from './socials/socials.module';
import { CategoriesModule } from './categories/categories.module';
import { ReviewModule } from './review/review.module';
import { TransactionModule } from './transaction/transaction.module';
import { ProfileModule } from './profile/profile.module';
import { WorksModule } from './works/works.module';
import { SmsModule } from './sms/sms.module';
import { ConfigModule } from '@nestjs/config';
import { BannerModule } from './banner/banner.module';



@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
    cache: true,
    expandVariables: true,
  }), AuthModule, UserModule, PrismaModule, TalentModule, SocialsModule, CategoriesModule, ReviewModule, TransactionModule, ProfileModule, WorksModule,  SmsModule, BannerModule],
  controllers: [],
  providers: [],
})
export class RootModule { }
