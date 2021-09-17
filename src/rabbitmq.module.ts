/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  RabbitMQModuleAsyncOptions,
  RabbitMQModuleOptions,
} from './rabbitmq.options';
import { RabbitMQCoreModule } from './rabbitmq.core-module';

@Global()
@Module({})
export class RabbitMQModule {
  public static forRoot(options: RabbitMQModuleOptions): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [RabbitMQCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(
    options: RabbitMQModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [RabbitMQCoreModule.forRootAsync(options)],
    };
  }
}
