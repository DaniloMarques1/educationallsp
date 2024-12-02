import log, { Log } from './log';
import { initialize } from './methods/initialize';
import { completion } from './methods/completion';
import { didChange } from './methods/completion';

interface Message {
  jsonrpc: string;
}

export interface NotificationMessage extends Message {
  method: string;
  params: unknown[] | object;
}

export interface RequestMessage extends NotificationMessage {
  id: number | string;
}

class LspServer {
  private readonly SEPARATOR = `\r\n\r\n`;
  private buffer: string = '';
  private log: Log;

  private readonly methodLookup = {
    initialize: initialize,
    'textDocument/completion': completion,
    'textDocument/didChange': didChange,
  };

  constructor(log: Log) {
    this.log = log;
  }

  run() {
    process.stdin.on('data', (chunk: Buffer) => this.receive(chunk));
  }

  // we just need to read the message where the first part if the content length and the second is the message itself
  private receive(chunck: Buffer) {
    const message = chunck.toString();
    this.log.write(message);

    const endOfContentLengthIndex = message.indexOf(this.SEPARATOR);
    const contentLength = this.getContentLength(
      message.substring(0, endOfContentLengthIndex),
    );
    const startOfMessageIndex = endOfContentLengthIndex + this.SEPARATOR.length;
    const msgBody = message.substring(startOfMessageIndex);
    this.buffer += msgBody;

    // not ready yet
    if (msgBody.length < contentLength) return;

    const requestMessage = this.getRequestMessage(this.buffer);
    if (!requestMessage) return;

    this.process(requestMessage);
  }

  private process(requestMessage: RequestMessage) {
    const method = this.methodLookup[requestMessage.method];
    if (method) {
      const result = method(requestMessage);
      // if it is a notification message, we do not have any response
      if (result) {
        this.respond(requestMessage.id, result);
      }
      this.buffer = '';
    }
  }

  private getContentLength(contentLengthLine: string): number {
    try {
      const arr = contentLengthLine.split(' ');
      return Number.parseInt(arr[1]);
    } catch (err) {
      return 0;
    }
  }

  private getRequestMessage(message: string): RequestMessage | null {
    try {
      const jsonMessage = JSON.parse(message);
      return jsonMessage as RequestMessage;
    } catch (err) {
      this.log.write(err);
      return null;
    }
  }

  private respond(id: number | string, result: object) {
    const body = JSON.stringify({ id, result });
    const responseContentLength = body.length;
    const header = `Content-Length: ${responseContentLength}${this.SEPARATOR}`;
    const response = `${header}${body}`;

    this.log.write(response);
    process.stdout.write(response);
  }
}

function main() {
  const lspServer = new LspServer({ write: log.write });
  lspServer.run();
}

main();
