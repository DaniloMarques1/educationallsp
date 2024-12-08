import { RequestMessage } from '../server';
import * as fs from 'fs';
import { DocumentUri } from '../documents';
import { Capability, Response } from '../capabilities/capabilities';

const words = fs.readFileSync('/usr/share/dict/words').toString().split('\n');

interface CompletionList {
  isIncomplete: boolean;
  items: CompletionItem[];
}

interface CompletionItem {
  label: string;
}

interface CompletionParams {
  textDocument: DocumentUri;
}

export class CompletionCapability implements Capability<RequestMessage> {
  process(message: RequestMessage): Response | null {
    const params = message.params as CompletionParams;
    let count = 0;
    const items = new Array<CompletionItem>();
    for (const word of words) {
      if (count == 100) break;

      items.push({
        label: word,
      });
      count++;
    }

    const completionList: CompletionList = {
      isIncomplete: true,
      items,
    };
    const response: Response = {
      message: JSON.stringify({ id: message.id, result: completionList }),
    };

    return response;
  }
}
