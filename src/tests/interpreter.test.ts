import { Interpreter } from '@t-script/language/interpreter';
import { Lexer } from '@t-script/language/lexer';
import { Parser } from '@t-script/language/parser';
import { describe, expect, test } from 'bun:test';

describe('interpreter', () => {
  test('should interpret and return the result of a simple addition', () => {
    const lexer = new Lexer('2 + 3');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const expression = parser.parse();

    expect(expression).not.toBeNull();

    if (!expression) {
      return;
    }

    const interpreter = new Interpreter();
    const result = interpreter.interpret(expression);

    expect(result).toBe('5');
  });

  test('should interpret and return the result of a string concatenation', () => {
    const lexer = new Lexer('"Hello, " + "world!"');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const expression = parser.parse();

    expect(expression).not.toBeNull();

    if (!expression) {
      return;
    }
    const interpreter = new Interpreter();
    const result = interpreter.interpret(expression);
    expect(result).toBe('Hello, world!');
  });

  test('should interpret and return the result of a ternary expression', () => {
    const lexer = new Lexer('5 > 3 ? "yes" : "no"');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const expression = parser.parse();
    expect(expression).not.toBeNull();

    if (!expression) {
      return;
    }

    const interpreter = new Interpreter();
    const result = interpreter.interpret(expression);
    expect(result).toBe('yes');
  });

  test('should interpret and return the result of a bitwise AND operation', () => {
    const lexer = new Lexer('6 & 3');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const expression = parser.parse();

    expect(expression).not.toBeNull();

    if (!expression) {
      return;
    }

    const interpreter = new Interpreter();
    const result = interpreter.interpret(expression);
    expect(result).toBe('2');
  });
  test('should interpret and return the result of a bitwise OR operation', () => {
    const lexer = new Lexer('6 | 3');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const expression = parser.parse();

    expect(expression).not.toBeNull();

    if (!expression) {
      return;
    }

    const interpreter = new Interpreter();
    const result = interpreter.interpret(expression);
    expect(result).toBe('7');
  });
});
