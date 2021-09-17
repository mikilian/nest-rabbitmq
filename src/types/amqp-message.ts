/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { MessageProperties } from 'amqplib';
import { RabbitMQCommonMessageFields } from './natives';

export interface AmqpMessage<T extends RabbitMQCommonMessageFields> {
  content: Buffer;
  fields: T;
  properties: MessageProperties;
}
