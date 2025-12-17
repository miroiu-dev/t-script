import { Lexer, TokenType, Token } from '@t-script/lexer';
import { describe, expect, test } from 'bun:test';

describe('Lexer', () => {
  function lex(code: string): Token[] {
    const lexer = new Lexer(code);
    return lexer.lex();
  }

  describe('Single Character Tokens', () => {
    test('should tokenize parentheses', () => {
      const tokens = lex('()');
      expect(tokens).toHaveLength(3); // LEFT_PAREN, RIGHT_PAREN, EOF
      expect(tokens[0]?.type).toBe(TokenType.LEFT_PAREN);
      expect(tokens[1]?.type).toBe(TokenType.RIGHT_PAREN);
      expect(tokens[2]?.type).toBe(TokenType.EOF);
    });

    test('should tokenize braces', () => {
      const tokens = lex('{}');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]?.type).toBe(TokenType.LEFT_BRACE);
      expect(tokens[1]?.type).toBe(TokenType.RIGHT_BRACE);
    });

    test('should tokenize brackets', () => {
      const tokens = lex('[]');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]?.type).toBe(TokenType.LEFT_BRACKET);
      expect(tokens[1]?.type).toBe(TokenType.RIGHT_BRACKET);
    });

    test('should tokenize single character operators', () => {
      const tokens = lex('+-*/.,:;');
      expect(tokens[0]?.type).toBe(TokenType.PLUS);
      expect(tokens[1]?.type).toBe(TokenType.MINUS);
      expect(tokens[2]?.type).toBe(TokenType.STAR);
      expect(tokens[3]?.type).toBe(TokenType.SLASH);
      expect(tokens[4]?.type).toBe(TokenType.DOT);
      expect(tokens[5]?.type).toBe(TokenType.COMMA);
      expect(tokens[6]?.type).toBe(TokenType.COLON);
      expect(tokens[7]?.type).toBe(TokenType.SEMICOLON);
    });

    test('should tokenize bang', () => {
      const tokens = lex('!');
      expect(tokens[0]?.type).toBe(TokenType.BANG);
    });

    test('should tokenize question mark', () => {
      const tokens = lex('?');
      expect(tokens[0]?.type).toBe(TokenType.QUESTION_MARK);
    });
  });

  describe('Multi-Character Tokens', () => {
    test('should tokenize equality operators', () => {
      const tokens = lex('== !=');
      expect(tokens[0]?.type).toBe(TokenType.EQUAL_EQUAL);
      expect(tokens[1]?.type).toBe(TokenType.BANG_EQUAL);
    });

    test('should tokenize comparison operators', () => {
      const tokens = lex('< <= > >=');
      expect(tokens[0]?.type).toBe(TokenType.LESS);
      expect(tokens[1]?.type).toBe(TokenType.LESS_EQUAL);
      expect(tokens[2]?.type).toBe(TokenType.GREATER);
      expect(tokens[3]?.type).toBe(TokenType.GREATER_EQUAL);
    });

    test('should tokenize increment and decrement operators', () => {
      const tokens = lex('++ --');
      expect(tokens[0]?.type).toBe(TokenType.PLUS_PLUS);
      expect(tokens[1]?.type).toBe(TokenType.MINUS_MINUS);
    });

    test('should tokenize bitwise operators', () => {
      const tokens = lex('& |');
      expect(tokens[0]?.type).toBe(TokenType.AMPERSAND);
      expect(tokens[1]?.type).toBe(TokenType.PIPE);
    });

    test('should tokenize logical operators', () => {
      const tokens = lex('&& ||');
      expect(tokens[0]?.type).toBe(TokenType.AND);
      expect(tokens[1]?.type).toBe(TokenType.OR);
    });

    test('should tokenize assignment operator', () => {
      const tokens = lex('= ==');
      expect(tokens[0]?.type).toBe(TokenType.EQUAL);
      expect(tokens[1]?.type).toBe(TokenType.EQUAL_EQUAL);
    });
  });

  describe('Number Tokens', () => {
    test('should tokenize integers', () => {
      const tokens = lex('42');
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[0]?.literal).toBe(42);
    });

    test('should tokenize decimal numbers', () => {
      const tokens = lex('3.14');
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[0]?.literal).toBe(3.14);
    });

    test('should tokenize multiple numbers', () => {
      const tokens = lex('10 20 30');
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[0]?.literal).toBe(10);
      expect(tokens[1]?.type).toBe(TokenType.NUMBER);
      expect(tokens[1]?.literal).toBe(20);
      expect(tokens[2]?.type).toBe(TokenType.NUMBER);
      expect(tokens[2]?.literal).toBe(30);
    });

    test('should tokenize numbers in expressions', () => {
      const tokens = lex('2 + 3 * 4');
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[0]?.literal).toBe(2);
      expect(tokens[1]?.type).toBe(TokenType.PLUS);
      expect(tokens[2]?.type).toBe(TokenType.NUMBER);
      expect(tokens[2]?.literal).toBe(3);
      expect(tokens[3]?.type).toBe(TokenType.STAR);
      expect(tokens[4]?.type).toBe(TokenType.NUMBER);
      expect(tokens[4]?.literal).toBe(4);
    });

    test('should tokenize zero', () => {
      const tokens = lex('0');
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[0]?.literal).toBe(0);
    });

    test('should tokenize numbers with leading zeros', () => {
      const tokens = lex('007');
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[0]?.literal).toBe(7);
    });
  });

  describe('String Tokens', () => {
    test('should tokenize string literals', () => {
      const tokens = lex('"hello"');
      expect(tokens[0]?.type).toBe(TokenType.STRING);
      expect(tokens[0]?.literal).toBe('hello');
    });

    test('should tokenize empty strings', () => {
      const tokens = lex('""');
      expect(tokens[0]?.type).toBe(TokenType.STRING);
      expect(tokens[0]?.literal).toBe('');
    });

    test('should tokenize strings with spaces', () => {
      const tokens = lex('"hello world"');
      expect(tokens[0]?.type).toBe(TokenType.STRING);
      expect(tokens[0]?.literal).toBe('hello world');
    });

    test('should handle escape sequences in strings', () => {
      const tokens = lex('"hello\\nworld"');
      expect(tokens[0]?.type).toBe(TokenType.STRING);
      expect(tokens[0]?.literal).toBe('hello\nworld');
    });

    test('should handle escaped quotes in strings', () => {
      const tokens = lex('"say \\"hello\\""');
      expect(tokens[0]?.type).toBe(TokenType.STRING);
      expect(tokens[0]?.literal).toBe('say "hello"');
    });

    test('should handle escaped backslash in strings', () => {
      const tokens = lex('"path\\\\to\\\\file"');
      expect(tokens[0]?.type).toBe(TokenType.STRING);
      expect(tokens[0]?.literal).toBe('path\\to\\file');
    });

    test('should handle tab escape sequence', () => {
      const tokens = lex('"hello\\tworld"');
      expect(tokens[0]?.type).toBe(TokenType.STRING);
      expect(tokens[0]?.literal).toBe('hello\tworld');
    });

    test('should handle carriage return escape sequence', () => {
      const tokens = lex('"hello\\rworld"');
      expect(tokens[0]?.type).toBe(TokenType.STRING);
      expect(tokens[0]?.literal).toBe('hello\rworld');
    });

    test('should handle null character escape sequence', () => {
      const tokens = lex('"hello\\0world"');
      expect(tokens[0]?.type).toBe(TokenType.STRING);
      expect(tokens[0]?.literal).toBe('hello\0world');
    });

    test('should handle unicode escape sequences', () => {
      const tokens = lex('"\\u0041"');
      expect(tokens[0]?.type).toBe(TokenType.STRING);
      expect(tokens[0]?.literal).toBe('A');
    });

    test('should handle hex escape sequences', () => {
      const tokens = lex('"\\x41"');
      expect(tokens[0]?.type).toBe(TokenType.STRING);
      expect(tokens[0]?.literal).toBe('A');
    });

    test('should throw error for unterminated string', () => {
      expect(() => lex('"unterminated')).toThrow();
    });
  });

  describe('Identifier Tokens', () => {
    test('should tokenize single character identifiers', () => {
      const tokens = lex('x y z');
      expect(tokens[0]?.type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0]?.text).toBe('x');
      expect(tokens[1]?.type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1]?.text).toBe('y');
      expect(tokens[2]?.type).toBe(TokenType.IDENTIFIER);
      expect(tokens[2]?.text).toBe('z');
    });

    test('should tokenize identifiers with underscores', () => {
      const tokens = lex('_private __dunder');
      expect(tokens[0]?.type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0]?.text).toBe('_private');
      expect(tokens[1]?.type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1]?.text).toBe('__dunder');
    });

    test('should tokenize identifiers with numbers', () => {
      const tokens = lex('var1 test123');
      expect(tokens[0]?.type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0]?.text).toBe('var1');
      expect(tokens[1]?.type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1]?.text).toBe('test123');
    });
  });

  describe('Keyword Tokens', () => {
    test('should tokenize class keyword', () => {
      const tokens = lex('class');
      expect(tokens[0]?.type).toBe(TokenType.CLASS);
    });

    test('should tokenize function keyword', () => {
      const tokens = lex('fun');
      expect(tokens[0]?.type).toBe(TokenType.FUN);
    });

    test('should tokenize control flow keywords', () => {
      const tokens = lex('if else while for return');
      expect(tokens[0]?.type).toBe(TokenType.IF);
      expect(tokens[1]?.type).toBe(TokenType.ELSE);
      expect(tokens[2]?.type).toBe(TokenType.WHILE);
      expect(tokens[3]?.type).toBe(TokenType.FOR);
      expect(tokens[4]?.type).toBe(TokenType.RETURN);
    });

    test('should tokenize variable declaration keywords', () => {
      const tokens = lex('var const');
      expect(tokens[0]?.type).toBe(TokenType.VAR);
      expect(tokens[1]?.type).toBe(TokenType.CONST);
    });

    test('should tokenize boolean literals', () => {
      const tokens = lex('true false');
      expect(tokens[0]?.type).toBe(TokenType.TRUE);
      expect(tokens[0]?.literal).toBe(true);
      expect(tokens[1]?.type).toBe(TokenType.FALSE);
      expect(tokens[1]?.literal).toBe(false);
    });

    test('should tokenize null keyword', () => {
      const tokens = lex('null');
      expect(tokens[0]?.type).toBe(TokenType.NULL);
      expect(tokens[0]?.literal).toBe(null);
    });

    test('should tokenize super and this keywords', () => {
      const tokens = lex('super this');
      expect(tokens[0]?.type).toBe(TokenType.SUPER);
      expect(tokens[1]?.type).toBe(TokenType.THIS);
    });
  });

  describe('Comments', () => {
    test('should skip single-line comments', () => {
      const tokens = lex('42 // this is a comment\n43');
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[0]?.literal).toBe(42);
      expect(tokens[1]?.type).toBe(TokenType.NUMBER);
      expect(tokens[1]?.literal).toBe(43);
    });

    test('should skip multi-line comments', () => {
      const tokens = lex('42 /* this is a\nmulti-line comment */ 43');
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[0]?.literal).toBe(42);
      expect(tokens[1]?.type).toBe(TokenType.NUMBER);
      expect(tokens[1]?.literal).toBe(43);
    });

    test('should throw error for unterminated multi-line comment', () => {
      expect(() => lex('42 /* unterminated comment')).toThrow();
    });
  });

  describe('Whitespace and Newlines', () => {
    test('should skip whitespace', () => {
      const tokens = lex('  42  +  3  ');
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[1]?.type).toBe(TokenType.PLUS);
      expect(tokens[2]?.type).toBe(TokenType.NUMBER);
      expect(tokens[3]?.type).toBe(TokenType.EOF);
    });

    test('should track line numbers correctly', () => {
      const tokens = lex('42\n43\n44');
      expect(tokens[0]?.line).toBe(1);
      expect(tokens[1]?.line).toBe(2);
      expect(tokens[2]?.line).toBe(3);
    });

    test('should handle tabs and carriage returns', () => {
      const tokens = lex('42\t+\r\n3');
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[0]?.literal).toBe(42);
      expect(tokens[1]?.type).toBe(TokenType.PLUS);
      expect(tokens[2]?.type).toBe(TokenType.NUMBER);
      expect(tokens[2]?.literal).toBe(3);
    });
  });

  describe('Complex Expressions', () => {
    test('should tokenize function declaration', () => {
      const tokens = lex('fun add(a, b) { return a + b; }');
      expect(tokens[0]?.type).toBe(TokenType.FUN);
      expect(tokens[1]?.type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1]?.text).toBe('add');
      expect(tokens[2]?.type).toBe(TokenType.LEFT_PAREN);
      expect(tokens[3]?.type).toBe(TokenType.IDENTIFIER);
      expect(tokens[3]?.text).toBe('a');
      expect(tokens[4]?.type).toBe(TokenType.COMMA);
      expect(tokens[5]?.type).toBe(TokenType.IDENTIFIER);
      expect(tokens[5]?.text).toBe('b');
      expect(tokens[6]?.type).toBe(TokenType.RIGHT_PAREN);
      expect(tokens[7]?.type).toBe(TokenType.LEFT_BRACE);
    });

    test('should tokenize conditional expression', () => {
      const tokens = lex(
        'if (x > 5) { print("big"); } else { print("small"); }'
      );
      expect(tokens[0]?.type).toBe(TokenType.IF);
      expect(tokens[1]?.type).toBe(TokenType.LEFT_PAREN);
      expect(tokens[2]?.type).toBe(TokenType.IDENTIFIER);
      expect(tokens[3]?.type).toBe(TokenType.GREATER);
    });

    test('should tokenize ternary expression', () => {
      const tokens = lex('x > 5 ? "big" : "small"');
      expect(tokens[0]?.type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1]?.type).toBe(TokenType.GREATER);
      expect(tokens[2]?.type).toBe(TokenType.NUMBER);
      expect(tokens[3]?.type).toBe(TokenType.QUESTION_MARK);
      expect(tokens[4]?.type).toBe(TokenType.STRING);
      expect(tokens[5]?.type).toBe(TokenType.COLON);
      expect(tokens[6]?.type).toBe(TokenType.STRING);
    });
  });

  describe('Token Properties', () => {
    test('should set correct token text', () => {
      const tokens = lex('hello');
      expect(tokens[0]?.text).toBe('hello');
    });

    test('should set correct token line and column', () => {
      const tokens = lex('42 + 3');
      expect(tokens[0]?.line).toBe(1);
      expect(tokens[1]?.line).toBe(1);
      expect(tokens[2]?.line).toBe(1);
    });

    test('should have EOF token at end', () => {
      const tokens = lex('42');
      expect(tokens[tokens.length - 1]?.type).toBe(TokenType.EOF);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for unexpected character', () => {
      expect(() => lex('@')).toThrow();
    });

    test('should throw error for invalid escape sequence', () => {
      expect(() => lex('"hello\\qworld"')).toThrow();
    });

    test('should throw error for incomplete unicode escape', () => {
      expect(() => lex('"\\u00"')).toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty input', () => {
      const tokens = lex('');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]?.type).toBe(TokenType.EOF);
    });

    test('should handle only whitespace', () => {
      const tokens = lex('   \n\t  ');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]?.type).toBe(TokenType.EOF);
    });

    test('should handle only comments', () => {
      const tokens = lex('// comment\n/* another */');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]?.type).toBe(TokenType.EOF);
    });

    test('should tokenize all single character operators together', () => {
      const tokens = lex('(){}[],.:;!?');
      expect(tokens).toHaveLength(13); // 12 tokens + EOF
      expect(tokens[tokens.length - 1]?.type).toBe(TokenType.EOF);
    });
  });
});
