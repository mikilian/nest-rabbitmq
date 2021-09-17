/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  AbstractRabbitMQTopic,
  InjectRabbitMQConnection,
  RabbitMQConnection,
  RabbitMQConnector,
  RabbitMQModule,
  RabbitMQMessage,
} from '../src';

@Injectable()
export class ExampleTopic extends AbstractRabbitMQTopic {
  public constructor(
    @InjectRabbitMQConnection()
    connection: RabbitMQConnection,
  ) {
    super('queue.topic', connection);
  }

  public async handle(msg: RabbitMQMessage): Promise<void> {
    this.log.log(` [x] ${msg.fields.routingKey}: ${msg.text()}`);
  }
}

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        hostname: config.get('AMQP_HOSTNAME') as string,
        username: config.get('AMQP_USERNAME') ?? 'admin',
        password: config.get('AMQP_PASSWORD') as string,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ExampleTopic],
})
class AppModule {}

const bootstrap = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  await app.get(ExampleTopic).bind('kern.*', '*.critical');

  await app
    .get(RabbitMQConnector)
    .sendToTopic('queue.topic', 'kern.critical', 'A critical kernel error');
  await app
    .get(RabbitMQConnector)
    .sendToTopic('queue.topic', 'user.critical', 'A critical user error');

  await app.close();
};

bootstrap().catch(console.error);
