import { Test, TestingModule } from '@nestjs/testing';
import { AirQualityController } from './air-quality.controller';
import { AirQualityService } from './air-quality.service';

describe('AirQualityController', () => {
  let controller: AirQualityController;
  let service: AirQualityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirQualityController],
      providers: [
        {
          provide: AirQualityService,
          useValue: {
            getAndFormatAirQuality: jest.fn(),
            getMostPollutedPeriod: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AirQualityController>(AirQualityController);
    service = module.get<AirQualityService>(AirQualityService);
  });

  describe('getAirQualityController', () => {
    it('should call getAndFormatAirQuality with correct parameters', async () => {
      const mockCoordinates = { latitude: 10, longitude: 20 };
      const mockResponse = {
        Result: {
          Pollution: {
            ts: 'ts',
            aqius: 20,
            mainus: 'pm2',
            aqicn: '40',
            maincn: 'pm2',
          },
        },
      };
      jest
        .spyOn(service, 'getAndFormatAirQuality')
        .mockResolvedValue(mockResponse);

      const result = await controller.getAirQuality(mockCoordinates);

      expect(service.getAndFormatAirQuality).toHaveBeenCalledWith(
        mockCoordinates.latitude,
        mockCoordinates.longitude,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle network error', async () => {
      jest
        .spyOn(service, 'getAndFormatAirQuality')
        .mockRejectedValue(new Error('Network error'));

      await expect(
        controller.getAirQuality({ latitude: 10, longitude: 20 }),
      ).rejects.toThrow('Network error');
    });

    it('should handle service error', async () => {
      jest
        .spyOn(service, 'getAndFormatAirQuality')
        .mockRejectedValue(new Error('Service error'));

      await expect(
        controller.getAirQuality({ latitude: 10, longitude: 20 }),
      ).rejects.toThrow('Service error');
    });

    it('should handle invalid data', async () => {
      jest
        .spyOn(service, 'getAndFormatAirQuality')
        .mockResolvedValue(undefined);

      const result = await controller.getAirQuality({
        latitude: 10,
        longitude: 20,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('getMostPollutedPeriod', () => {
    it('should call getMostPollutedPeriod and return data', async () => {
      const mockResponse = {
        iqAirDateTime: new Date(),
        airQualitySavedAt: new Date(),
      };
      jest
        .spyOn(service, 'getMostPollutedPeriod')
        .mockResolvedValue(mockResponse);

      const result = await controller.getMostPollutedPeriod();

      expect(service.getMostPollutedPeriod).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should handle database error', async () => {
      jest
        .spyOn(service, 'getMostPollutedPeriod')
        .mockRejectedValue(new Error('Database error'));

      await expect(controller.getMostPollutedPeriod()).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle empty database', async () => {
      jest.spyOn(service, 'getMostPollutedPeriod').mockResolvedValue(undefined);

      const result = await controller.getMostPollutedPeriod();
      expect(result).toBeUndefined();
    });

    it('should handle unexpected exceptions', async () => {
      jest
        .spyOn(service, 'getMostPollutedPeriod')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(controller.getMostPollutedPeriod()).rejects.toThrow(
        'Unexpected error',
      );
    });
  });
});
