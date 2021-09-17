/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import {
  Global,
  OnApplicationShutdown,
  DynamicModule,
  Module,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { connect, Connection } from 'amqplib';
import {
  RabbitMQModuleOptions,
  RabbitMQModuleAsyncOptions,
} from './rabbitmq.options';
import { RabbitMQConnector } from './rabbitmq.connector';
import {
  RABBITMQ_CONNECTION,
  RABBITMQ_MODULE_OPTIONS,
} from './types/constants';

@Global()
@Module({})
export class RabbitMQCoreModule implements OnApplicationShutdown {
  public constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationShutdown() {
    const connection = this.moduleRef.get(RABBITMQ_CONNECTION) as Connection;

    if (connection != undefined) {
      await connection.close();
    }
  }

  public static forRoot(options: RabbitMQModuleOptions): DynamicModule {
    return {
      module: RabbitMQCoreModule,
      providers: [
        {
          provide: RABBITMQ_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: RABBITMQ_CONNECTION,
          useFactory: async () => await connect(options),
        },
        RabbitMQConnector,
      ],
      exports: [RABBITMQ_CONNECTION, RabbitMQConnector],
    };
  }

  public static forRootAsync(
    options: RabbitMQModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: RabbitMQCoreModule,
      imports: options.imports,
      providers: [
        {
          provide: RABBITMQ_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        {
          provide: RABBITMQ_CONNECTION,
          useFactory: async (options: RabbitMQModuleOptions) =>
            await connect(options),
          inject: [RABBITMQ_MODULE_OPTIONS],
        },
        RabbitMQConnector,
      ],
      exports: [RABBITMQ_CONNECTION, RabbitMQConnector],
    };
  }
}
