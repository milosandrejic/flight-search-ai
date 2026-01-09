import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { ChatController } from 'src/controllers/chat.controller';
import { SearchHistoryController } from 'src/controllers/search-history.controller';
import { SearchHistoryRepository } from 'src/repositories/search-history.repository';
import { SearchHistory } from 'src/models/search-history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get('LOG_LEVEL', 'info'),
          transport:
            configService.get('NODE_ENV') === 'development'
              ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                  singleLine: false,
                },
              }
              : undefined,
          serializers: {
            req: (req) => ({
              method: req.method,
              url: req.url,
            }),
            res: (res) => ({
              statusCode: res.statusCode,
            }),
          },
          customProps: () => ({
            service: 'flight-search-mcp',
          }),
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'flight_search_mcp'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // CRITICAL: Never use synchronize - always use migrations
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([SearchHistory]),
  ],
  controllers: [AppController, ChatController, SearchHistoryController],
  providers: [AppService, SearchHistoryRepository],
})
export class AppModule {}
