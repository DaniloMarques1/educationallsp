import { RequestMessage } from '../server';
import { Capability, Response } from './capabilities';
import { Range } from './types';

interface FullDocumentDiagnosticReport {
  kind: string;
  items: Diagnostic[];
}

interface Diagnostic {
  message: string;
  data?: unknown;
  source?: string;
  severity: DiagnosticSeverity;
  range: Range;
}

namespace DiagnosticSeverity {
  export const Error: 1 = 1;
  export const Warning: 2 = 2;
  export const Information: 3 = 3;
  export const Hint: 4 = 4;
}

type DiagnosticSeverity = 1 | 2 | 3 | 4;

export class DiagnosticCapability implements Capability<RequestMessage> {
  process(message: RequestMessage): Response | null {
    const result: FullDocumentDiagnosticReport = {
      kind: 'full',
      items: [
        {
          message: 'This is incorrect',
          source: 'educational lsp',
          severity: DiagnosticSeverity.Error,
          range: {
            start: { line: 0, character: 4 },
            end: { line: 0, character: 8 },
          },
        },
      ],
    };

    return { message: JSON.stringify({ id: message.id, result }) };
  }
}
