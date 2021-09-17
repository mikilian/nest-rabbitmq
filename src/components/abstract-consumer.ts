/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { Logger } from '@nestjs/common';
import { RabbitMQMessage } from '../types/rabbitmq-message';
import { AmqpMessage } from '../types/amqp-message';
import {
  isAsyncRabbitMQConsumerErrorFunction,
  RabbitMQCommonMessageFields,
  RabbitMQConnection,
  RabbitMQConsumerErrorFn,
  RabbitMQMessageFields,
} from '../types/natives';

export abstract class AbstractRabbitMQConsumer<
  T extends RabbitMQCommonMessageFields = RabbitMQMessageFields,
  Ret = void,
> {
  protected readonly log: Logger;
  protected errorFn?: RabbitMQConsumerErrorFn;

  protected constructor(
    protected readonly queue: string,
    protected readonly connection: RabbitMQConnection,
  ) {
    this.log = new Logger(queue, { timestamp: false });
  }

  public abstract bind(): Promise<void>;
  public abstract handle(msg: RabbitMQMessage<T>): Promise<Ret>;

  public onError(fn: RabbitMQConsumerErrorFn | null): this {
    this.errorFn = fn ?? undefined;

    return this;
  }

  public setDefaultOnErrorMethod(): this {
    this.errorFn = (err: any): void => {
      this.log.error(err?.message ?? `${err}`);
    };

    return this;
  }

  protected callback(msg: AmqpMessage<T> | null): void {
    if (msg !== null) {
      this.handle(new RabbitMQMessage<T>(msg)).catch((e: any) => {
        if (this.errorFn) {
          if (isAsyncRabbitMQConsumerErrorFunction(this.errorFn)) {
            this.errorFn(e).catch(console.error);
          } else {
            this.errorFn(e);
          }
        }
      });
    }
  }
}
