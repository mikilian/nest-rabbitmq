/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { RabbitMQMessage } from '../types/rabbitmq-message';
import { RabbitMQConnection } from '../types/natives';
import { AbstractRabbitMQConsumer } from './abstract-consumer';

export abstract class AbstractRabbitMQKeyBasedConsumer extends AbstractRabbitMQConsumer {
  protected constructor(
    queue: string,
    private readonly type: string,
    connection: RabbitMQConnection,
  ) {
    super(queue, connection);
  }

  public async bind(...keys: Array<string>): Promise<void> {
    const channel = await this.connection.createChannel();

    await channel.assertExchange(this.queue, this.type, { durable: false });

    const { queue } = await channel.assertQueue('', { exclusive: true });

    for (const key of keys) {
      await channel.bindQueue(queue, this.queue, key);
    }

    await channel.consume(queue, this.callback.bind(this), {
      noAck: true,
    });
  }

  public abstract handle(msg: RabbitMQMessage): Promise<void>;
}
