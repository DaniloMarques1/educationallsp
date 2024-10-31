import log from './log';
import { initialize } from './methods/initialize';
import { completion } from './methods/completion';

interface Message {
  jsonrpc: string;
}

export interface RequestMessage extends Message {
  id: number | string;
  method: string;
  params: unknown[] | object;
}

const methodLookup = {
  initialize: initialize,
  'textDocument/completion': completion,
};

let buffer = '';
process.stdin.on('data', (chunck: Buffer) => {
  log.write(chunck.toString());

  const message = chunck.toString();
  const endOfContentLength = message.indexOf(`\r\n\r\n`);
  const contentLength = getContentLength(
    message.substring(0, endOfContentLength),
  );

  const startOfMessage = endOfContentLength + 4;
  const rawMessage = message.substring(startOfMessage);
  buffer += rawMessage;

  // if we have not received enought bytes yet we will wait
  if (contentLength < buffer.length) return;

  const request = parseMessage(buffer);
  const method = methodLookup[request.method];

  if (method) respond(request.id, method(request));

  // restarting buffer
  buffer = '';
});

function parseMessage(message: string): RequestMessage {
  const jsonMessage = JSON.parse(message);
  return jsonMessage as RequestMessage;
}

function getContentLength(contentLengthLine: string) {
  const arr = contentLengthLine.split(' ');
  return Number.parseInt(arr[1]);
}

function respond(id: number | string, result: object) {
  const message = JSON.stringify({ id, result });
  const responseContentLength = message.length;
  const header = `Content-Length: ${responseContentLength}\r\n\r\n`;
  const response = `${header}${message}`;

  process.stdout.write(response);
}
