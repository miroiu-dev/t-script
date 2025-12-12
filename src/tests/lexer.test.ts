import { describe, expect, test } from 'bun:test';
import { Lexer, LexerError, TokenType } from '@t-script/language/lexer';

describe('Lexer', () => {
  test('should handle white space characters', () => {
    const lexer = new Lexer('  \t  \n  +  \t  ');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(2);
    expect(tokens[0]?.type).toBe(TokenType.PLUS);
    expect(tokens[1]?.type).toBe(TokenType.EOF);
  });

  test('should tokenize simple expressions', () => {
    const lexer = new Lexer('+-');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(3);
    expect(tokens[0]?.type).toBe(TokenType.PLUS);
    expect(tokens[1]?.type).toBe(TokenType.MINUS);
    expect(tokens[2]?.type).toBe(TokenType.EOF);
  });

  test('should throw an error for unrecognized characters', () => {
    const lexer = new Lexer('@');
    expect(() => lexer.lex()).toThrowError(LexerError);
  });

  test('should skip single-line comments', () => {
    const lexer = new Lexer('+-// this is a comment\n*;');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(5);
    expect(tokens[0]?.type).toBe(TokenType.PLUS);
    expect(tokens[1]?.type).toBe(TokenType.MINUS);
    expect(tokens[2]?.type).toBe(TokenType.STAR);
    expect(tokens[3]?.type).toBe(TokenType.SEMICOLON);
  });

  test('should skip multi-line comments', () => {
    const lexer = new Lexer('+-/* multi-line \n comment */*;');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(5);
    expect(tokens[0]?.type).toBe(TokenType.PLUS);
    expect(tokens[1]?.type).toBe(TokenType.MINUS);
    expect(tokens[2]?.type).toBe(TokenType.STAR);
    expect(tokens[3]?.type).toBe(TokenType.SEMICOLON);
  });

  test('should skip commented out multi-line comments', () => {
    const lexer = new Lexer(`
      // /*
      // This is a multi-line comment
      // */
      `);
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(1);
    expect(tokens[0]?.type).toBe(TokenType.EOF);
  });

  test('should throw an error for unterminated multi-line comments', () => {
    const lexer = new Lexer('+-/* unterminated comment *;');
    expect(() => lexer.lex()).toThrowError(LexerError);
  });

  test('should handle string literal', () => {
    const lexer = new Lexer('"hello world"');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(2);
    expect(tokens[0]?.type).toBe(TokenType.STRING);
    expect(tokens[0]?.literal).toBe('hello world');
  });

  test('should throw an error for unterminated string literals', () => {
    const lexer = new Lexer('"unterminated string');
    expect(() => lexer.lex()).toThrowError(LexerError);
  });

  test('should handle multiline string literals', () => {
    const lexer = new Lexer('"This is a \nmultiline string"');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(2);
    expect(tokens[0]?.type).toBe(TokenType.STRING);
    expect(tokens[0]?.literal).toBe('This is a \nmultiline string');
  });

  test('should handle escaped characters in string literals', () => {
    const lexer = new Lexer('"line1\\nline2\\tTabbed\\\\"');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(2);
    expect(tokens[0]?.type).toBe(TokenType.STRING);
    expect(tokens[0]?.literal).toBe('line1\nline2\tTabbed\\');
  });

  test('should handle unicode escape sequences in string literals', () => {
    const lexer = new Lexer('"Unicode test: \\u0041\\u0042\\u0043"');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(2);
    expect(tokens[0]?.type).toBe(TokenType.STRING);
    expect(tokens[0]?.literal).toBe('Unicode test: ABC');
  });

  test('should handle invalid unicode escape sequences in string literals', () => {
    const lexer = new Lexer('"Invalid unicode: \\u00G1"');
    expect(() => lexer.lex()).toThrowError(LexerError);
  });

  test('should handle hex escape sequences in string literals', () => {
    const lexer = new Lexer('"Hex test: \\x41\\x42\\x43"');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(2);
    expect(tokens[0]?.type).toBe(TokenType.STRING);
    expect(tokens[0]?.literal).toBe('Hex test: ABC');
  });

  test('should handle invalid hex escape sequences in string literals', () => {
    const lexer = new Lexer('"Invalid hex: \\x4G"');
    expect(() => lexer.lex()).toThrowError(LexerError);
  });

  test('should handle integer literals', () => {
    const lexer = new Lexer('12345');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(2);
    expect(tokens[0]?.type).toBe(TokenType.NUMBER);
    expect(tokens[0]?.literal).toBe(12345);
  });

  test('should handle decimal literals', () => {
    const lexer = new Lexer('123.45');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(2);
    expect(tokens[0]?.type).toBe(TokenType.NUMBER);
    expect(tokens[0]?.literal).toBe(123.45);
  });

  test('should tokenize identifiers and keywords', () => {
    const lexer = new Lexer('const myVar = 10;');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(6);
    expect(tokens[0]?.type).toBe(TokenType.CONST);
    expect(tokens[1]?.type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1]?.text).toBe('myVar');
    expect(tokens[2]?.type).toBe(TokenType.EQUAL);
    expect(tokens[3]?.type).toBe(TokenType.NUMBER);
    expect(tokens[3]?.literal).toBe(10);
  });

  test('should tokenize grouped expressions', () => {
    const lexer = new Lexer('(2 + 3) * 4');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(8);
    expect(tokens[0]?.type).toBe(TokenType.LEFT_PAREN);
    expect(tokens[1]?.type).toBe(TokenType.NUMBER);
    expect(tokens[1]?.literal).toBe(2);
    expect(tokens[2]?.type).toBe(TokenType.PLUS);
    expect(tokens[3]?.type).toBe(TokenType.NUMBER);
    expect(tokens[3]?.literal).toBe(3);
    expect(tokens[4]?.type).toBe(TokenType.RIGHT_PAREN);
    expect(tokens[5]?.type).toBe(TokenType.STAR);
    expect(tokens[6]?.type).toBe(TokenType.NUMBER);
    expect(tokens[6]?.literal).toBe(4);
  });

  test('should handle ternary operator expression', () => {
    const lexer = new Lexer('a ? b : c');
    const tokens = lexer.lex();

    expect(tokens).toHaveLength(6);
    expect(tokens[0]?.type).toBe(TokenType.IDENTIFIER);
    expect(tokens[0]?.text).toBe('a');
    expect(tokens[1]?.type).toBe(TokenType.QUESTION_MARK);
    expect(tokens[2]?.type).toBe(TokenType.IDENTIFIER);
    expect(tokens[2]?.text).toBe('b');
    expect(tokens[3]?.type).toBe(TokenType.COLON);
    expect(tokens[4]?.type).toBe(TokenType.IDENTIFIER);
    expect(tokens[4]?.text).toBe('c');
  });
});
