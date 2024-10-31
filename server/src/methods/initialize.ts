import { RequestMessage } from '../server';

interface InitializeResult {
  capabilities: ServerCapabilities;
  serverInfo: ServerInfo;
}

interface ServerCapabilities {
  definitionProvider: boolean;
  completionProvider: object;
}

interface ServerInfo {
  name: string;
  version?: string;
}

export const initialize = (message: RequestMessage): InitializeResult => {
  const result: InitializeResult = {
    serverInfo: {
      name: 'cool-lsp',
      version: '0.0.0.1',
    },
    capabilities: {
      definitionProvider: true,
      completionProvider: {},
    },
  };

  return result;
};
