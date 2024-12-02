import { RequestMessage } from '../server';
import * as fs from 'fs';
import { DocumentUri } from '../documents';

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

export const completion = (message: RequestMessage): CompletionList => {
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

  return {
    isIncomplete: true,
    items,
  };
};
