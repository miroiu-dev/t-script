import { AstPrinter } from '@t-script/parser';
import { describe, expect, test } from 'bun:test';
import * as Expression from '@t-script/parser/expressions';
import { Token, TokenType } from '@t-script/lexer';

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
});
