import log, { Log } from './log';
import { InitializeCapability } from './capabilities/initialize';
import { CompletionCapability } from './capabilities/completion';
import { Capability } from './capabilities/capabilities';
import { didChange } from './capabilities/did-change';

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

  constructor(log: Log) {
    this.log = log;
  }

  // TODO: maybe turn this into a lookup?
  private getCapabilityFromMethod(
    method: string,
  ): Capability<RequestMessage | NotificationMessage> | null {
    this.log.write(`searching method for ${method}`);
    switch (method) {
      case 'initialize': {
        return new InitializeCapability();
      }
      case 'textDocument/completion': {
        return new CompletionCapability();
      }
      default:
        return null;
    }
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
    this.buffer = '';
    this.log.write(`request for ${requestMessage?.method}`);
    if (!requestMessage) return;

    this.process(requestMessage);
  }

  private process(requestMessage: RequestMessage) {
    const capability = this.getCapabilityFromMethod(requestMessage.method);
    this.log.write(
      `found method ${JSON.stringify(capability)} for ${requestMessage.method}`,
    );
    if (capability) {
      const result = capability.process(requestMessage);
      // if it is a notification message, we do not have any response
      if (result && result.message) {
        this.respond(result.message);
      }
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
      return jsonMessage;
    } catch (err) {
      this.log.write(`Error is ${err.message}`);
      return null;
    }
  }

  private respond(result: string) {
    this.log.write(`result ${JSON.stringify(result)}`);
    const responseContentLength = result.length;
    const header = `Content-Length: ${responseContentLength}${this.SEPARATOR}`;
    const response = `${header}${result}`;

    this.log.write(response);
    process.stdout.write(response);
  }
}

function main() {
  const lspServer = new LspServer({ write: log.write });
  lspServer.run();
}

main();
