/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { RabbitMQMessage } from '../types/rabbitmq-message';
import { AbstractRabbitMQConsumer } from './abstract-consumer';

export abstract class AbstractRabbitMQWorker extends AbstractRabbitMQConsumer {
  public async bind(): Promise<void> {
    const channel = await this.connection.createChannel();

    await channel.assertQueue(this.queue, { durable: true });
    await channel.prefetch(1);
    await channel.consume(this.queue, this.callback.bind(this), {
      noAck: true,
    });
  }

  public abstract handle(msg: RabbitMQMessage): Promise<void>;
}
