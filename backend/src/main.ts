import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 4000);
  const apiPrefix = configService.get<string>('API_PREFIX', '/api/v1');
  const allowedOrigins = configService.get<string>(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://localhost:5173',
  ).split(',');

  // 1. Security Headers (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. Cookie Parser Middleware
  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));

  // 3. CORS Configuration
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 4. API Global Prefix
  app.setGlobalPrefix(apiPrefix);

  // 5. Global DTO Validation Pipe
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

  // 6. OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sector Institute Management API')
    .setDescription(
      'Enterprise REST API documentation for Sector Educational Institute Management System (Sri Lanka).',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('admin_session')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.listen(port);
  logger.log(`🚀 Sector Backend Server running on http://localhost:${port}${apiPrefix}`);
  logger.log(`📚 OpenAPI Documentation available at http://localhost:${port}${apiPrefix}/docs`);
}

bootstrap();
