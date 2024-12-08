import { NotificationMessage } from '../server';
import { documents } from '../documents';
import { Capability, Response } from './capabilities';

interface TextDocumentIdentifier {
  uri: string;
}

interface VersionedTextDocumentIdentifier extends TextDocumentIdentifier {
  version: number;
}

interface TextDocumentContentChangeEvent {
  text: string;
}

interface DidChangeTextDocumentParams {
  textDocument: VersionedTextDocumentIdentifier;
  contentChanges: TextDocumentContentChangeEvent[];
}

export const didChange = (message: NotificationMessage): void => {
  const params = message.params as DidChangeTextDocumentParams;
  documents.set(params.textDocument.uri, params.contentChanges[0].text);
};

export class DidChangeCapability implements Capability<NotificationMessage> {
  process(message: NotificationMessage): Response | null {
    const params = message.params as DidChangeTextDocumentParams;
    documents.set(params.textDocument.uri, params.contentChanges[0].text);
    return null;
  }
}
