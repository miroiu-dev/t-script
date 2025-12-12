import { AstPrinter, Parser } from '@t-script/language/parser';
import { describe, expect, test } from 'bun:test';
import * as Expression from '@t-script/language/parser/expressions';
import { Lexer, Token, TokenType } from '@t-script/language/lexer';

describe('parser', () => {
  test('print ast tree', () => {
    const printer = new AstPrinter();

    const ast = new Expression.Binary(
      new Expression.Unary(
        new Token(TokenType.MINUS, '-', null, 1, 1, 1),
        new Expression.Literal(123)
      ),
      new Token(TokenType.STAR, '*', null, 1, 5, 1),
      new Expression.Grouping(new Expression.Literal(45.67))
    );

    const result = printer.print(ast);
    expect(result).toBe('(* (- 123) (group 45.67))');
  });

  test('should handle equality check', () => {
    const lexer = new Lexer('1 == 1');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();

    if (!ast) return;

    const astPrinter = new AstPrinter();
    const printResult = astPrinter.print(ast);

    expect(printResult).toBe('(== 1 1)');
  });

  test('should handle basic arithmetic operations', () => {
    const lexer = new Lexer('2 + 3 * 4');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();

    if (!ast) return;

    const astPrinter = new AstPrinter();
    const printResult = astPrinter.print(ast);

    expect(printResult).toBe('(+ 2 (* 3 4))');
  });

  test('should handle subtraction and division', () => {
    const lexer = new Lexer('10 - 6 / 2');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();

    if (!ast) return;

    const astPrinter = new AstPrinter();
    const printResult = astPrinter.print(ast);

    expect(printResult).toBe('(- 10 (/ 6 2))');
  });

  test('should handle grouped expressions', () => {
    const lexer = new Lexer('(2 + 3) * 4');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();

    expect(ast).toBeTruthy();

    if (!ast) return;

    const astPrinter = new AstPrinter();
    const printResult = astPrinter.print(ast);

    expect(printResult).toBe('(* (group (+ 2 3)) 4)');
  });

  test('should handle unary operators', () => {
    const lexer = new Lexer('-5 + 3');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();

    if (!ast) return;

    const astPrinter = new AstPrinter();
    const printResult = astPrinter.print(ast);

    expect(printResult).toBe('(+ (- 5) 3)');
  });

  test('should handle negation operator', () => {
    const lexer = new Lexer('!true');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();

    if (!ast) return;

    const astPrinter = new AstPrinter();
    const printResult = astPrinter.print(ast);

    expect(printResult).toBe('(! true)');
  });

  test('should handle comparison operators', () => {
    const cases = [
      { input: '5 > 3', expected: '(> 5 3)' },
      { input: '2 < 7', expected: '(< 2 7)' },
      { input: '4 >= 4', expected: '(>= 4 4)' },
      { input: '3 <= 5', expected: '(<= 3 5)' },
      { input: '1 != 2', expected: '(!= 1 2)' },
    ];

    cases.forEach(({ input, expected }) => {
      const lexer = new Lexer(input);
      const tokens = lexer.lex();
      const parser = new Parser(tokens);

      const ast = parser.parse();
      expect(ast).toBeTruthy();

      if (!ast) return;

      const astPrinter = new AstPrinter();
      const printResult = astPrinter.print(ast);

      expect(printResult).toBe(expected);
    });
  });

  test('should handle string literals', () => {
    const lexer = new Lexer('"hello" + "world"');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();

    if (!ast) return;

    const astPrinter = new AstPrinter();
    const printResult = astPrinter.print(ast);

    expect(printResult).toBe('(+ hello world)');
  });

  test('should handle decimal numbers', () => {
    const lexer = new Lexer('3.14 * 2.5');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();

    if (!ast) return;

    const astPrinter = new AstPrinter();
    const printResult = astPrinter.print(ast);

    expect(printResult).toBe('(* 3.14 2.5)');
  });

  test('should handle complex nested expressions', () => {
    const lexer = new Lexer('(1 + 2) * (3 - 4) / 5');
    const tokens = lexer.lex();
    const parser = new Parser(tokens);

    const ast = parser.parse();
    expect(ast).toBeTruthy();

    if (!ast) return;

    const astPrinter = new AstPrinter();
    const printResult = astPrinter.print(ast);

    expect(printResult).toBe('(/ (* (group (+ 1 2)) (group (- 3 4))) 5)');
  });

  test('should handle boolean literals', () => {
    const cases = [
      { input: 'true', expected: 'true' },
      { input: 'false', expected: 'false' },
      { input: 'true == false', expected: '(== true false)' },
    ];

    cases.forEach(({ input, expected }) => {
      const lexer = new Lexer(input);
      const tokens = lexer.lex();
      const parser = new Parser(tokens);

      const ast = parser.parse();
      expect(ast).toBeTruthy();

      if (!ast) return;

      const astPrinter = new AstPrinter();
      const printResult = astPrinter.print(ast);

      expect(printResult).toBe(expected);
    });
  });

  test('should handle operator precedence correctly', () => {
    const cases = [
      { input: '1 + 2 * 3', expected: '(+ 1 (* 2 3))' },
      { input: '1 * 2 + 3', expected: '(+ (* 1 2) 3)' },
      { input: '1 + 2 == 3', expected: '(== (+ 1 2) 3)' },
      { input: '1 == 2 + 3', expected: '(== 1 (+ 2 3))' },
    ];

    cases.forEach(({ input, expected }) => {
      const lexer = new Lexer(input);
      const tokens = lexer.lex();
      const parser = new Parser(tokens);

      const ast = parser.parse();
      expect(ast).toBeTruthy();

      if (!ast) return;

      const astPrinter = new AstPrinter();
      const printResult = astPrinter.print(ast);

      expect(printResult).toBe(expected);
    });
  });
});
