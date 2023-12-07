import {
  Injectable,
  NotFoundException,
  Logger as logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { map } from 'rxjs/operators';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AirQuality, AirQualityDocument } from './schema/air-quality.schema';
import { getConfig } from '../config/configuration';
import { lastValueFrom } from 'rxjs';
import { Dates } from '../types';

@Injectable()
export class AirQualityService {
  constructor(
    @InjectModel(AirQuality.name)
    private airQualityModel: Model<AirQualityDocument>,
    private httpService: HttpService,
  ) {}

  getAirQuality(latitude: number, longitude: number) {
    const { iqairBaseUrl, iqairApiKey } = getConfig();
    const url = `${iqairBaseUrl}/nearest_city?lat=${latitude}&lon=${longitude}&key=${iqairApiKey}`;

    return this.httpService
      .get(url)
      .pipe(map((response) => response.data.data));
  }

  async saveAirQualityData(data: AirQuality): Promise<AirQuality> {
    const newAirQuality = new this.airQualityModel(data);
    return newAirQuality.save();
  }

  async getAndFormatAirQuality(latitude: number, longitude: number) {
    const {
      current: {
        pollution: { ts, aqius, mainus, aqicn, maincn },
      },
    } = await lastValueFrom(this.getAirQuality(latitude, longitude));

    const data = {
      Result: {
        Pollution: {
          ts,
          aqius,
          mainus,
          aqicn,
          maincn,
        },
      },
    };

    return data;
  }

  async getMostPollutedPeriod(): Promise<Dates> {
    const airQuality = await this.airQualityModel
      .findOne({ location: 'Paris' })
      .sort({ aqius: -1 }) // Sort in descending order of AQI
      .lean()
      .exec();

    if (!airQuality) {
      throw new NotFoundException(
        'No Air quality index has been saved. Try again in 1 minute',
      );
    }

    const { iqAirDateTime, createdAt } = airQuality;

    return { iqAirDateTime, airQualitySavedAt: createdAt };
  }

  // Save Air quality index for Paris every one minute
  @Cron(CronExpression.EVERY_MINUTE)
  parisAirQualityCronHandler() {
    const parisCoordinates = { latitude: 48.856613, longitude: 2.352222 };
    this.getAirQuality(
      parisCoordinates.latitude,
      parisCoordinates.longitude,
    ).subscribe({
      next: (data) => {
        logger.log(
          `Cron job data for Paris at time: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          data,
        );
        if (data && data.current && data.current.pollution) {
          this.saveAirQualityData({
            location: 'Paris',
            aqius: data.current.pollution.aqius,
            iqAirDateTime: data.current.pollution.ts,
          });
        } else {
          logger.error('Invalid data format received');
        }
      },
      error: (error) => logger.error(`Error in CRON job:`, error),
    });
  }
}
