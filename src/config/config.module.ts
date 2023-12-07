import { Module } from '@nestjs/common';
import { getConfig } from './configuration';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [getConfig],
      validationSchema,
    }),
  ],
  providers: [],
  exports: [],
})
export class AppConfigModule {}
