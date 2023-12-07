import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AirQualityController } from './air-quality.controller';
import { AirQualityService } from './air-quality.service';
import { AirQuality, AirQualitySchema } from './schema/air-quality.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AirQuality.name, schema: AirQualitySchema },
    ]),
    HttpModule,
  ],
  controllers: [AirQualityController],
  providers: [AirQualityService],
})
export class AirQualityModule {}
