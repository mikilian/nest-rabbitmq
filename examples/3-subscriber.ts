/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  AbstractRabbitMQSubscriber,
  InjectRabbitMQConnection,
  RabbitMQConnection,
  RabbitMQConnector,
  RabbitMQModule,
  RabbitMQMessage,
} from '../src';

@Injectable()
export class ExampleSubscriber1 extends AbstractRabbitMQSubscriber {
  public constructor(
    @InjectRabbitMQConnection()
    connection: RabbitMQConnection,
  ) {
    super('queue.subscriber', connection);
  }

  public async handle(msg: RabbitMQMessage): Promise<void> {
    this.log.log(`susbcriber1 received: ${msg.text()}`);
  }
}

@Injectable()
export class ExampleSubscriber2 extends AbstractRabbitMQSubscriber {
  public constructor(
    @InjectRabbitMQConnection()
    connection: RabbitMQConnection,
  ) {
    super('queue.subscriber', connection);
  }

  public async handle(msg: RabbitMQMessage): Promise<void> {
    this.log.log(`subscriber2 received: ${msg.text()}`);
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
  providers: [ExampleSubscriber1, ExampleSubscriber2],
})
class AppModule {}

const bootstrap = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  await app.get(ExampleSubscriber1).bind();
  await app.get(ExampleSubscriber2).bind();

  const connector = app.get(RabbitMQConnector);

  await connector.publish('queue.subscriber', 'Hello there');

  await app.close();
};

bootstrap().catch(console.error);
