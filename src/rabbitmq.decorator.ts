/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { Inject } from '@nestjs/common';
import { RABBITMQ_CONNECTION } from './types/constants';

export const InjectRabbitMQConnection = (): ParameterDecorator =>
  Inject(RABBITMQ_CONNECTION);
