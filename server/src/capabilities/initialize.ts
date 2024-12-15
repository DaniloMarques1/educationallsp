import { RequestMessage } from '../server';
import { Capability, Response } from './capabilities';

interface InitializeResult {
  capabilities: ServerCapabilities;
  serverInfo: ServerInfo;
}

interface ServerCapabilities {
  definitionProvider: boolean;
  completionProvider: object;
  diagnosticProvider: object;
  textDocumentSync: number;
}

interface ServerInfo {
  name: string;
  version?: string;
}

// TODO: better name maybe? not really a capability
export class InitializeCapability implements Capability<RequestMessage> {
  process(message: RequestMessage): Response | null {
    const result: InitializeResult = {
      serverInfo: {
        name: 'text-lsp',
        version: '0.0.0.1',
      },
      capabilities: {
        definitionProvider: true,
        completionProvider: {},
        textDocumentSync: 1,
        diagnosticProvider: {
          interfileDependencies: false,
          workspaceDiagnostic: false,
        },
      },
    };

    return {
      message: JSON.stringify({
        id: message.id,
        result,
      }),
    };
  }
}
