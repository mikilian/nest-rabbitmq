/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
import { Injectable } from '@nestjs/common';
import { v4 as uuid4 } from 'uuid';
import { InjectRabbitMQConnection } from './rabbitmq.decorator';
import { RabbitMQChannel, RabbitMQConnection } from './types/natives';
import { RabbitMQResponse } from './types/rabbitmq-response';

@Injectable()
export class RabbitMQConnector {
  public constructor(
    @InjectRabbitMQConnection() private readonly connection: RabbitMQConnection,
  ) {}

  private async executeRoutine(
    callback: (channel: RabbitMQChannel) => Promise<boolean>,
  ): Promise<boolean> {
    const channel = await this.connection.createChannel();
    const result = await callback(channel);

    await channel.close();

    return result;
  }

  public async sendToListener(queue: string, data: Buffer): Promise<boolean>;
  public async sendToListener(queue: string, data: string): Promise<boolean>;
  public async sendToListener(
    queue: string,
    data: Record<string, any>,
  ): Promise<boolean>;
  public async sendToListener(
    queue: string,
    data: Buffer | string | Record<string, any>,
  ): Promise<boolean> {
    return await this.executeRoutine(async (channel) => {
      await channel.assertQueue(queue, { durable: false });
      return channel.sendToQueue(queue, this.makeParam(data));
    });
  }

  public async sendToWorker(queue: string, data: Buffer): Promise<boolean>;
  public async sendToWorker(queue: string, data: string): Promise<boolean>;
  public async sendToWorker(
    queue: string,
    data: Record<string, any>,
  ): Promise<boolean>;
  public async sendToWorker(
    queue: string,
    data: Buffer | string | Record<string, any>,
  ): Promise<boolean> {
    return await this.executeRoutine(async (channel) => {
      await channel.assertQueue(queue, { durable: true });
      return channel.sendToQueue(queue, this.makeParam(data), {
        persistent: true,
      });
    });
  }

  public async publish(exchange: string, data: Buffer): Promise<boolean>;
  public async publish(exchange: string, data: string): Promise<boolean>;
  public async publish(
    exchange: string,
    data: Record<string, any>,
  ): Promise<boolean>;
  public async publish(
    exchange: string,
    data: Buffer | string | Record<string, any>,
  ): Promise<boolean> {
    return this.executeRoutine(async (channel) => {
      await channel.assertExchange(exchange, 'fanout', { durable: false });
      return channel.publish(exchange, '', this.makeParam(data));
    });
  }

  public async sendToRoute(
    exchange: string,
    key: string,
    data: Buffer,
  ): Promise<boolean>;
  public async sendToRoute(
    exchange: string,
    key: string,
    data: string,
  ): Promise<boolean>;
  public async sendToRoute(
    exchange: string,
    key: string,
    data: Record<string, any>,
  ): Promise<boolean>;
  public async sendToRoute(
    exchange: string,
    key: string,
    data: Buffer | string | Record<string, any>,
  ): Promise<boolean> {
    return this.executeRoutine(async (channel) => {
      await channel.assertExchange(exchange, 'direct', { durable: false });
      return channel.publish(exchange, key, this.makeParam(data));
    });
  }

  public async sendToTopic(
    exchange: string,
    key: string,
    data: Buffer,
  ): Promise<boolean>;
  public async sendToTopic(
    exchange: string,
    key: string,
    data: string,
  ): Promise<boolean>;
  public async sendToTopic(
    exchange: string,
    key: string,
    data: Record<string, any>,
  ): Promise<boolean>;
  public async sendToTopic(
    exchange: string,
    key: string,
    data: Buffer | string | Record<string, any>,
  ): Promise<boolean> {
    return this.executeRoutine(async (channel) => {
      await channel.assertExchange(exchange, 'topic', { durable: false });
      return channel.publish(exchange, key, this.makeParam(data));
    });
  }

  public async query(queue: string, data: Buffer): Promise<RabbitMQResponse>;
  public async query(queue: string, data: string): Promise<RabbitMQResponse>;
  public async query(
    queue: string,
    data: Record<string, any>,
  ): Promise<RabbitMQResponse>;
  public async query(
    queue: string,
    data: Buffer | string | Record<string, any>,
  ): Promise<RabbitMQResponse> {
    return new Promise<RabbitMQResponse>(async (resolve) => {
      const id = uuid4();

      const channel = await this.connection.createChannel();
      const queueData = await channel.assertQueue('', { exclusive: true });
      await channel.consume(
        queueData.queue,
        async (msg) => {
          if (msg && msg.properties.correlationId === id) {
            await channel.deleteQueue(queueData.queue);
            await channel.close();

            resolve(new RabbitMQResponse(msg.content));
          }
        },
        { noAck: true },
      );
      return channel.sendToQueue(queue, this.makeParam(data), {
        correlationId: id,
        replyTo: queueData.queue,
      });
    });
  }

  private makeParam(data: Buffer | string | Record<string, any>): Buffer {
    return data instanceof Buffer
      ? data
      : Buffer.from(
          typeof data === 'object' ? JSON.stringify(data) : `${data}`,
        );
  }
}
