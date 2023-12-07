import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { AirQualityService } from './air-quality.service';
import { JoiValidationPipe } from '../common/pipes/request-validation-pipe';
import { GetAirQualityValidation } from './dto/schema';

@Controller('air-quality')
export class AirQualityController {
  constructor(private readonly airQualityService: AirQualityService) {}

  @Get()
  @UsePipes(new JoiValidationPipe(GetAirQualityValidation))
  async getAirQuality(
    @Query() params: { latitude: number; longitude: number },
  ) {
    return this.airQualityService.getAndFormatAirQuality(
      params.latitude,
      params.longitude,
    );
  }

  @Get('datetime/most-polluted')
  async getMostPollutedPeriod() {
    return this.airQualityService.getMostPollutedPeriod();
  }
}
