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



@Module({
  imports: [AuthModule, UserModule, PrismaModule, TalentModule, SocialsModule, CategoriesModule, ReviewModule, TransactionModule, ProfileModule],
  controllers: [],
  providers: [],
})
export class RootModule {}
