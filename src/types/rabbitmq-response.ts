/**
 * @author    Michael Kilian
 * @copyright 2021, https://github.com/mikilian
 * @license   MIT
 */
export class RabbitMQResponse {
  public constructor(public readonly content: Buffer) {}

  public text(encoding?: BufferEncoding): string {
    return this.content.toString(encoding);
  }

  public json<T = Record<string, any>>(
    encoding?: BufferEncoding,
  ): T | undefined {
    try {
      return JSON.parse(this.text(encoding)) as unknown as T;
    } catch {}
  }
}
