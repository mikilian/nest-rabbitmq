/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { AbstractRabbitMQKeyBasedConsumer } from './abstract-key-based-consumer';
import { RabbitMQConnection } from '../types/natives';

export abstract class AbstractRabbitMQRouting extends AbstractRabbitMQKeyBasedConsumer {
  protected constructor(queue: string, connection: RabbitMQConnection) {
    super(queue, 'direct', connection);
  }
}
