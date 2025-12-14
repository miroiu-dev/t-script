import { Interpreter } from '@t-script/interpreter';
import { Lexer } from '@t-script/lexer';
import { Parser } from '@t-script/parser';
import { describe, test } from 'bun:test';

describe('T Script', () => {
  test('script is valid', () => {
    const source = `
        var x = 1;
        print(x++);
        print(x);
        for(var i = 0; i < 10; i = i + 1){
            print(x, i);
        }
    `;

    const lexer = new Lexer(source);
    const tokens = lexer.lex();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const interpreter = new Interpreter();
    interpreter.interpret(ast);
  });
});
