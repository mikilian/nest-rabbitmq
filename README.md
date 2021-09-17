# @mikilian/rabbitmq-module

A wrapper of the [AMQP library](https://www.npmjs.com/package/amqplib) for [NestJS](https://nestjs.com)
to provide fast communication between services. The idea behind it is to provide possible ways of
communication with a message system without having to write a lot of code.

## Installation

```bash
# using yarn
yarn install @mikilian/rabbitmq-module

# using npm
npm install --save @mikilian/rabbitmq-module
```

## Usage

```ts
import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@mikilian/rabbitmq-module'

@Module({
    imports: [
        RabbitMQModule.forRoot({
            hostname: 'localhost',
            username: 'admin',
            password: 'pw'
        }),
    ]
})
export class AppModule {}
```

You can also use a factory to create the configuration file.

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@mikilian/rabbitmq-module'

@Module({
    imports: [
        RabbitMQModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                hostname: config.get('ENV_FOR_HOSTNAME') as string,
                username: config.get('ENV_FOR_USERNAME') as string,
                password: config.get('ENV_FOR_PASSWORD') as string,
            }),
            inject: [ConfigService]
        })
    ]
})
export class AppModule {}
```

## Examples

To run the examples, a RabbitMQ server is required. Afterwards three environment
variables are needed, so it is recommended to export them in the terminal.

```sh
export AMQP_HOSTNAME=''
export AMQP_USERNAME=''
export AMQP_PASSWORD=''
```

Now any example can be executed using `yarn run example:<ID>`.
The code can be found in the `examples` directory.
