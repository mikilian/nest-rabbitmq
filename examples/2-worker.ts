/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  AbstractRabbitMQWorker,
  InjectRabbitMQConnection,
  RabbitMQConnection,
  RabbitMQConnector,
  RabbitMQModule,
  RabbitMQMessage,
} from '../src';

@Injectable()
export class ExampleWorker1 extends AbstractRabbitMQWorker {
  public constructor(
    @InjectRabbitMQConnection()
    connection: RabbitMQConnection,
  ) {
    super('queue.worker', connection);
  }

  public async handle(msg: RabbitMQMessage): Promise<void> {
    this.log.log(`worker1 received: ${msg.text()}`);
  }
}

@Injectable()
export class ExampleWorker2 extends AbstractRabbitMQWorker {
  public constructor(
    @InjectRabbitMQConnection()
    connection: RabbitMQConnection,
  ) {
    super('queue.worker', connection);
  }

  public async handle(msg: RabbitMQMessage): Promise<void> {
    this.log.log(`worker2 received: ${msg.text()}`);
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
  providers: [ExampleWorker1, ExampleWorker2],
})
class AppModule {}

const bootstrap = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  await app.get(ExampleWorker1).bind();
  await app.get(ExampleWorker2).bind();

  const connector = app.get(RabbitMQConnector);

  await Promise.all(
    ['Some message', 'Another message', 'foo', 'bar', 'baz'].map((message) =>
      connector.sendToWorker('queue.worker', message),
    ),
  );

  await app.close();
};

bootstrap().catch(console.error);
