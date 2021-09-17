/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  AbstractRabbitMQRpc,
  InjectRabbitMQConnection,
  RabbitMQConnection,
  RabbitMQConnector,
  RabbitMQModule,
  RabbitMQMessage,
} from '../src';

@Injectable()
export class ExampleRpc extends AbstractRabbitMQRpc<string> {
  public constructor(
    @InjectRabbitMQConnection()
    connection: RabbitMQConnection,
  ) {
    super('queue.rpc', connection);
  }

  public async handle(msg: RabbitMQMessage): Promise<string> {
    this.log.log(`server received: ${msg.text()}`);

    return 'bar';
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
  providers: [ExampleRpc],
})
class AppModule {}

const bootstrap = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  await app.get(ExampleRpc).bind();

  const response = await app.get(RabbitMQConnector).query('queue.rpc', 'foo');
  console.log(`client received: ${response.text()}`);

  await app.close();
};

bootstrap().catch(console.error);
