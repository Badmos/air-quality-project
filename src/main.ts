import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RequestMethod, Logger as logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { getConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  const config = new DocumentBuilder()
    .setTitle('air-quality-project')
    .setDescription('The Air Quality API Service')
    .setVersion('1.0')
    .addTag('air-quality-project')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(getConfig().port);
  logger.log(`Air quality application started on port ${getConfig().port}`);
}
bootstrap();
