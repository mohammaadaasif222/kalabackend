import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // Runs every 10 minutes
  @Cron('*/10 * * * *')
  async handleKeepAlive() {
    try {
      const apiUrl = this.configService.get<string>('API_URL');
      const endpoint = `${apiUrl}/health`; // or any lightweight endpoint
      
      this.logger.log('Pinging server to keep alive...');
      
      const response = await firstValueFrom(
        this.httpService.get(endpoint, { timeout: 5000 })
      );
      
      this.logger.log(`Keep-alive ping successful: ${response.status}`);
    } catch (error) {
      this.logger.error('Keep-alive ping failed:', error.message);
    }
  }
}