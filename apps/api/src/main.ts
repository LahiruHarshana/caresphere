import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.youtube.com", "https://www.youtube-nocookie.com", "https://*.youtube.com", "https://*.google.com", "https://www.google.com", "https://apis.google.com", "https://ssl.gstatic.com", "https://www.gstatic.com"],
        'frame-src': ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com", "https://*.youtube.com"],
        'connect-src': ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com", "https://*.youtube.com", "https://*.google.com", "https://jnn-pa.googleapis.com"],
        'img-src': ["'self'", "data:", "https:", "https://*.google.com", "https://*.googleusercontent.com"],
      },
    },
  }));
  app.use(compression());

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
    credentials: true,
  });
  
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
  console.log(`🚀 API running on http://localhost:${process.env.PORT ?? 4000}`);
  console.log(`📚 Swagger docs at http://localhost:${process.env.PORT ?? 4000}/api/docs`);
}
bootstrap();
