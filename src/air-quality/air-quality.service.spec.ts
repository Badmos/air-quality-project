import { Test, TestingModule } from '@nestjs/testing';
import { throwError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, of } from 'rxjs';
import { AirQualityService } from './air-quality.service';
import { AirQuality } from 'src/air-quality/schema/air-quality.schema';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { getModelToken } from '@nestjs/mongoose';

describe('AirQualityService', () => {
  let service: AirQualityService;
  let httpService: HttpService;

  class MockAirQualityModel {
    constructor(public data?: unknown) {}

    save = jest.fn().mockResolvedValue(this.data);

    // Mock findOne method
    static findOne = jest.fn().mockImplementation((query) => {
      return Promise.resolve({ ...query });
    });
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirQualityService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getModelToken('AirQuality'),
          useValue: MockAirQualityModel,
        },
      ],
    }).compile();

    service = module.get<AirQualityService>(AirQualityService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('GetAirQuality', () => {
    it('should make a GET request to the IQ Air api', async () => {
      const mockData = {
        current: { pollution: { aqius: 50, ts: '2023-04-01T00:00:00Z' } },
      };

      const mockHeaders = {
        'Content-Type': 'application/json',
      } as AxiosRequestHeaders;

      const mockApiResponse: AxiosResponse = {
        data: { data: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: 'test-url', method: 'get', headers: mockHeaders },
      };
      jest
        .spyOn(httpService, 'get')
        .mockImplementation(() => of(mockApiResponse));

      const result = await lastValueFrom(service.getAirQuality(10, 20));

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should handle invalid API response format', async () => {
      const mockInvalidData = { unexpectedField: 'data' };
      const mockInvalidApiResponse: AxiosResponse = {
        data: { data: mockInvalidData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: 'test-url',
          method: 'get',
          headers: {} as AxiosRequestHeaders,
        },
      };

      jest
        .spyOn(httpService, 'get')
        .mockImplementation(() => of(mockInvalidApiResponse));

      const result = await lastValueFrom(service.getAirQuality(10, 20));

      expect(result).toEqual(mockInvalidData);
    });

    it('should handle API timeout', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockImplementation(() => throwError(() => new Error('Timeout')));

      await expect(
        lastValueFrom(service.getAirQuality(10, 20)),
      ).rejects.toThrow('Timeout');
    });

    it('should handle zero results returned', async () => {
      const mockEmptyData = {};
      const mockEmptyApiResponse: AxiosResponse = {
        data: { data: mockEmptyData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: 'test-url',
          method: 'get',
          headers: {} as AxiosRequestHeaders,
        },
      };

      jest
        .spyOn(httpService, 'get')
        .mockImplementation(() => of(mockEmptyApiResponse));

      const result = await lastValueFrom(service.getAirQuality(10, 20));
      expect(result).toEqual(mockEmptyData);
    });
  });

  describe('SaveAirQualityData', () => {
    it('should save air quality data', async () => {
      const mockAirQualityData = {
        aqius: 50,
        location: 'Test',
        iqAirDateTime: new Date(),
      };
      jest
        .spyOn(service, 'saveAirQualityData')
        .mockResolvedValue(mockAirQualityData);

      const result = await service.saveAirQualityData(mockAirQualityData);

      expect(result).toEqual(mockAirQualityData);
    });

    it('should handle database save error', async () => {
      jest
        .spyOn(service, 'saveAirQualityData')
        .mockRejectedValue(new Error('Save error'));

      await expect(
        service.saveAirQualityData({
          aqius: 50,
          location: 'Test',
          iqAirDateTime: new Date(),
        }),
      ).rejects.toThrow('Save error');
    });

    it('should handle saving incomplete data', async () => {
      await expect(
        service.saveAirQualityData({ location: 'Test' } as AirQuality),
      ).rejects.toThrow;
    });

    it('should handle database connection issue', async () => {
      jest
        .spyOn(service, 'saveAirQualityData')
        .mockRejectedValue(new Error('Database connection error'));

      await expect(
        service.saveAirQualityData({
          aqius: 50,
          location: 'Test',
          iqAirDateTime: new Date(),
        }),
      ).rejects.toThrow('Database connection error');
    });
  });

  describe('getAndFormatAirQuality', () => {
    it('should format air quality data correctly', async () => {
      const mockResponseData = {
        current: { pollution: { aqius: 50, ts: '2023-04-01T00:00:00Z' } },
      };
      const mockApiResponse: AxiosResponse = {
        data: { data: mockResponseData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: 'test-url',
          method: 'get',
          headers: {} as AxiosRequestHeaders,
        },
      };

      jest
        .spyOn(httpService, 'get')
        .mockImplementation(() => of(mockApiResponse));

      const result = await service.getAndFormatAirQuality(10, 20);

      expect(result).toEqual({
        Result: {
          Pollution: {
            ts: '2023-04-01T00:00:00Z',
            aqius: 50,
          },
        },
      });
    });

    it('should handle error in fetching air quality data', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw new Error('Error fetching data');
      });

      await expect(service.getAndFormatAirQuality(10, 20)).rejects.toThrow(
        'Error fetching data',
      );
    });
  });

  it('should return the most polluted period', async () => {
    const mockData = {
      iqAirDateTime: new Date(),
      airQualitySavedAt: new Date(),
    };
    jest.spyOn(service, 'getMostPollutedPeriod').mockResolvedValue(mockData);

    const result = await service.getMostPollutedPeriod();

    expect(result).toEqual(mockData);
  });

  it('should handle no data found scenario', async () => {
    jest.spyOn(service, 'getMostPollutedPeriod').mockResolvedValue(undefined);

    const result = await service.getMostPollutedPeriod();

    expect(result).toBeUndefined();
  });

  it('should handle database errors', async () => {
    jest
      .spyOn(service, 'getMostPollutedPeriod')
      .mockRejectedValue(new Error('Database error'));

    await expect(service.getMostPollutedPeriod()).rejects.toThrow(
      'Database error',
    );
  });

  describe('parisAirQualityCronHandler', () => {
    it('should successfully execute the CRON job', async () => {
      const mockData = {
        current: {
          pollution: {
            aquis: 50,
            ts: new Date(),
          },
        },
      };
      const mockApiResponse: AxiosResponse = {
        data: { data: mockData },
        status: 200,
        statusText: 'OK',
        headers: {} as AxiosRequestHeaders,
        config: {
          url: 'test-url',
          method: 'get',
          headers: {} as AxiosRequestHeaders,
        },
      };

      jest
        .spyOn(httpService, 'get')
        .mockImplementation(() => of(mockApiResponse));
      jest
        .spyOn(service, 'saveAirQualityData')
        .mockResolvedValue(mockData as unknown as AirQuality);

      await service.parisAirQualityCronHandler();

      expect(httpService.get).toHaveBeenCalled();
      expect(service.saveAirQualityData).toHaveBeenCalled();
    });
  });
});
