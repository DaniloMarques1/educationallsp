import { RequestMessage } from '../server';
import * as fs from 'fs';
import { documents, DocumentUri } from '../documents';
import { Capability, Response } from '../capabilities/capabilities';
import log from '../log';

const words = fs.readFileSync('/usr/share/dict/words').toString().split('\n');

interface CompletionList {
  isIncomplete: boolean;
  items: CompletionItem[];
}

interface CompletionItem {
  label: string;
}

interface TextDocumentIdentifier {
  uri: DocumentUri;
}
interface Position {
  line: number;
  character: number;
}

interface TextDocumentPositionParams {
  textDocument: TextDocumentIdentifier;
  position: Position;
}

interface CompletionParams extends TextDocumentPositionParams {}

export class CompletionCapability implements Capability<RequestMessage> {
  private readonly MAX_LENGTH = 100;

  process(message: RequestMessage): Response | null {
    const params = message.params as CompletionParams;
    const documentUri = params.textDocument.uri;
    const content = documents.get(documentUri);
    if (content == null || content?.length === 0) return null;

    const currentLine = content.split('\n')[params.position.line];
    const lineUntilCursor = currentLine.slice(0, params.position.character);
    const currentWordUnderCursor = lineUntilCursor.replace(/.*\W(.*?)/, '$1');

    const items: Array<CompletionItem> = words
      .filter((word) => {
        return word.startsWith(currentWordUnderCursor);
      })
      .slice(0, this.MAX_LENGTH)
      .map((word) => {
        return { label: word };
      });

    const completionList: CompletionList = {
      isIncomplete: items.length === this.MAX_LENGTH,
      items,
    };
    const response: Response = {
      message: JSON.stringify({ id: message.id, result: completionList }),
    };

    return response;
  }
}
