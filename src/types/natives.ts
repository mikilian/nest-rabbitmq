/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import {
  CommonMessageFields,
  MessageFields,
  ConsumeMessageFields,
  Connection,
  Channel,
} from 'amqplib';

export type RabbitMQConnection = Connection;
export type RabbitMQChannel = Channel;
export type RabbitMQCommonMessageFields = CommonMessageFields;
export type RabbitMQMessageFields = MessageFields;
export type RabbitMQRpcMessageFields = ConsumeMessageFields;
export type RabbitMQConsumerAsyncErrorFn = (err: any) => Promise<void>;
export type RabbitMQConsumerSyncErrorFn = (err: any) => void;
export type RabbitMQConsumerErrorFn =
  | RabbitMQConsumerAsyncErrorFn
  | RabbitMQConsumerSyncErrorFn;

export const isAsyncFunction = <T = (...args: Array<any>) => Promise<void>>(
  data: unknown,
): data is T => (data as any)?.constructor?.name === 'AsyncFunction';

export const isAsyncRabbitMQConsumerErrorFunction = (
  data: RabbitMQConsumerErrorFn,
): data is RabbitMQConsumerAsyncErrorFn =>
  isAsyncFunction<RabbitMQConsumerAsyncErrorFn>(data);
