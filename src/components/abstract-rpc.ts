/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */

import { RabbitMQMessage } from '../types/rabbitmq-message';
import {
  isAsyncRabbitMQConsumerErrorFunction,
  RabbitMQRpcMessageFields,
} from '../types/natives';
import { AbstractRabbitMQConsumer } from './abstract-consumer';
import { Channel, ConsumeMessage } from 'amqplib';

export abstract class AbstractRabbitMQRpc<
  T = any,
> extends AbstractRabbitMQConsumer<RabbitMQRpcMessageFields, T> {
  protected replyToQueue<T>(
    channel: Channel,
    msg: ConsumeMessage,
    data: T,
  ): void {
    const { correlationId } = msg.properties;

    channel.sendToQueue(
      msg.properties.replyTo,
      data instanceof Buffer
        ? data
        : Buffer.from(
            data instanceof Uint8Array
              ? data
              : typeof data === 'object'
              ? JSON.stringify(data)
              : `${data}`,
          ),
      { correlationId },
    );

    channel.ack(msg);
  }

  public async bind(): Promise<void> {
    const channel = await this.connection.createChannel();

    await channel.assertQueue(this.queue, { durable: true });
    await channel.prefetch(1);
    await channel.consume(this.queue, (msg) => {
      if (msg !== null) {
        this.handle(new RabbitMQMessage<RabbitMQRpcMessageFields>(msg))
          .then((result: unknown) => this.replyToQueue(channel, msg, result))
          .catch((e: any) => {
            if (this.errorFn) {
              if (isAsyncRabbitMQConsumerErrorFunction(this.errorFn)) {
                this.errorFn(e).catch(console.error);
              } else {
                this.errorFn(e);
              }
            }

            if (typeof e.name === 'string') {
              this.replyToQueue(channel, msg, {
                exception: {
                  name: e.name,
                  message: e.message,
                },
              });
            } else {
              this.replyToQueue(channel, msg, { error: `${e}` });
            }
          });
      }
    });
  }

  public abstract handle(
    msg: RabbitMQMessage<RabbitMQRpcMessageFields>,
  ): Promise<T>;
}
