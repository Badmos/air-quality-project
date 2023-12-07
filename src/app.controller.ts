import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ApiRootResponse, HealthCheckResponse } from './types';

@Controller()
export class AppController {
  @Get()
  @ApiExcludeEndpoint()
  root(): ApiRootResponse {
    return {
      status: 'success',
      message: 'Welcome to the Air Quality Api Service',
    };
  }

  //We can set up a heartbeat check that pings this resource every 30 secs to confirm the health of the service
  @Get('health')
  @ApiExcludeEndpoint()
  healthCheck(): HealthCheckResponse {
    return {
      status: 'success',
      message: 'healthy',
    };
  }
}
