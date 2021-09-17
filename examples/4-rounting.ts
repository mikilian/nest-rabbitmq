/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  AbstractRabbitMQRouting,
  InjectRabbitMQConnection,
  RabbitMQConnection,
  RabbitMQConnector,
  RabbitMQModule,
  RabbitMQMessage,
} from '../src';

@Injectable()
export class ExampleRouting extends AbstractRabbitMQRouting {
  public constructor(
    @InjectRabbitMQConnection()
    connection: RabbitMQConnection,
  ) {
    super('queue.routing', connection);
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
  providers: [ExampleRouting],
})
class AppModule {}

const bootstrap = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  await app.get(ExampleRouting).bind('warning', 'error');

  await app
    .get(RabbitMQConnector)
    .sendToRoute('queue.routing', 'error', 'Run. Run. Or it will explode.');

  await app
    .get(RabbitMQConnector)
    .sendToRoute('queue.routing', 'warning', 'Just a little warning ;-)');

  await app.close();
};

bootstrap().catch(console.error);
