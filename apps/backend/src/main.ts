import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Prefixo global da API
  const apiPrefix = process.env.API_PREFIX || '/api/v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5175',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validacao global
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

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('ERP SaaS - Materiais de Construcao')
    .setDescription('API do sistema ERP Multi-Tenant para varejo e atacado de materiais de construcao')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Autenticacao e autorizacao')
    .addTag('Tenants', 'Gestao de tenants')
    .addTag('Empresas', 'Gestao de empresas')
    .addTag('Filiais', 'Gestao de filiais')
    .addTag('Usuarios', 'Gestao de usuarios')
    .addTag('Health', 'Health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port);

  logger.log(`===========================================`);
  logger.log(`ERP SaaS Backend rodando na porta ${port}`);
  logger.log(`Swagger: http://localhost:${port}/api/docs`);
  logger.log(`API: http://localhost:${port}${apiPrefix}`);
  logger.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`===========================================`);
}

bootstrap();
