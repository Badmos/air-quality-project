import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getServiceBaseResponse(): string {
    return 'Air Quality Api';
  }
}
