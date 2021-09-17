/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { MessageProperties } from 'amqplib';
import { AmqpMessage } from './amqp-message';
import { RabbitMQCommonMessageFields, RabbitMQMessageFields } from './natives';
import { RabbitMQResponse } from './rabbitmq-response';

export class RabbitMQMessage<
  T extends RabbitMQCommonMessageFields = RabbitMQMessageFields,
  >
  extends RabbitMQResponse
  implements AmqpMessage<T>
{
  public readonly fields: T;
  public readonly properties: MessageProperties;

  public constructor(msg: AmqpMessage<T>) {
    super(msg.content);

    this.fields = msg.fields;
    this.properties = msg.properties;
  }
}
