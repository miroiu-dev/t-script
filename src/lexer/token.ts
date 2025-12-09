import type { TokenType } from './tokenType';

class Token {
  private line: number;
  private column: number;
  private length: number;
  private type: TokenType;
  private literal: unknown;
  private text: string;

  constructor();
}

export { Token };
