/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  AbstractRabbitMQListener,
  InjectRabbitMQConnection,
  RabbitMQConnection,
  RabbitMQConnector,
  RabbitMQModule,
  RabbitMQMessage,
} from '../src';

@Injectable()
export class ExampleListener extends AbstractRabbitMQListener {
  public constructor(
    @InjectRabbitMQConnection()
    connection: RabbitMQConnection,
  ) {
    super('queue.listener', connection);
  }

  public async handle(msg: RabbitMQMessage): Promise<void> {
    this.log.log(`received: ${msg.text()}`);
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
  providers: [ExampleListener],
})
class AppModule {}

const bootstrap = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  await app.get(ExampleListener).bind();

  await app
    .get(RabbitMQConnector)
    .sendToListener('queue.listener', 'Hello, world!');

  await app.close();
};

bootstrap().catch(console.error);
