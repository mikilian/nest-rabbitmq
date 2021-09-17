/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { RabbitMQMessage } from '../types/rabbitmq-message';
import { AbstractRabbitMQConsumer } from './abstract-consumer';

export abstract class AbstractRabbitMQSubscriber extends AbstractRabbitMQConsumer {
  public async bind(): Promise<void> {
    const channel = await this.connection.createChannel();

    await channel.assertExchange(this.queue, 'fanout', { durable: false });

    const { queue } = await channel.assertQueue('', { exclusive: true });

    await channel.bindQueue(queue, this.queue, '');
    await channel.consume(queue, this.callback.bind(this), {
      noAck: true,
    });
  }

  public abstract handle(msg: RabbitMQMessage): Promise<void>;
}
