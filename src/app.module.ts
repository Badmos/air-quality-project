import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AirQualityModule } from './air-quality/air-quality.module';
import { ScheduleModule } from '@nestjs/schedule';
import { getConfig } from './config/configuration';
import { AppConfigModule } from './config/config.module';
import { Logger as logger } from '@nestjs/common';
import mongoose from 'mongoose';

const {
  database: { dbUri, dbName },
} = getConfig();

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const connection = await mongoose.createConnection(dbUri, {
          dbName,
        });

        connection.on('error', (err) => {
          logger.error('Mongoose connection error:', err);
        });

        connection.once('open', () => {
          logger.log('Connected to MongoDB');
        });

        return {
          uri: dbUri,
        };
      },
    }),
    ScheduleModule.forRoot(),
    AirQualityModule,
  ],
})
export class AppModule {}
