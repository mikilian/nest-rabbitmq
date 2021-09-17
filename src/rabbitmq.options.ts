/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { ModuleMetadata } from '@nestjs/common';

export interface AmqpConnectionOptions {
  hostname: string;
  username: string;
  password: string;
  port?: number;
}

export interface AmqpOptionalConnectionOptions {
  protocol?: string;
  locale?: string;
  frameMax?: number;
  heartbeat?: number;
  vhost?: string;
}

export type RabbitMQModuleOptions = AmqpConnectionOptions &
  AmqpOptionalConnectionOptions;

export interface RabbitMQModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: Array<any>
  ) => Promise<RabbitMQModuleOptions> | RabbitMQModuleOptions;
  inject?: Array<any>;
}
