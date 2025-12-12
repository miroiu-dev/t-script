import { TokenType } from './tokenType';

export const keywords: Record<string, TokenType> = {
  class: TokenType.CLASS,
  if: TokenType.IF,
  else: TokenType.ELSE,
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  for: TokenType.FOR,
  fun: TokenType.FUN,
  null: TokenType.NULL,
  return: TokenType.RETURN,
  super: TokenType.SUPER,
  this: TokenType.THIS,
  var: TokenType.VAR,
  const: TokenType.CONST,
  while: TokenType.WHILE,
};
