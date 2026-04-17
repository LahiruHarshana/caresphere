import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.enableCors();
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('CareSphere API')
    .setDescription('The CareSphere marketplace API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Serve static files from the uploads directory
  app.useStaticAssets(join(__dirname, '..', 'tmp', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
