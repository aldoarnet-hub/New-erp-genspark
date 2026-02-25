import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { HealthModule } from './modules/health/health.module';
import { FiscalModule } from './modules/fiscal/fiscal.module';
import { CadastrosModule } from './modules/cadastros/cadastros.module';
import { ContabilModule } from './modules/contabil/contabil.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    // Configuracao global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env', '../../.env'],
    }),

    // TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host', 'localhost'),
        port: configService.get('database.port', 5432),
        username: configService.get('database.username', 'postgres'),
        password: configService.get('database.password', 'postgres'),
        database: configService.get('database.name', 'erp_dev'),
        autoLoadEntities: true,
        synchronize: configService.get('database.synchronize', true),
        logging: configService.get('database.logging', false),
      }),
    }),

    // Modulos do sistema
    HealthModule,
    AuthModule,
    CoreModule,
    FiscalModule,
    CadastrosModule,
    ContabilModule,
  ],
})
export class AppModule {}
