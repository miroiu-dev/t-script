import { Interpreter } from '@t-script/interpreter';
import { Lexer } from '@t-script/lexer';
import { Parser } from '@t-script/parser';

async function run() {
  const interpreter = new Interpreter();

  const prompt = 'Welcome to T-Script REPL. Type your code below:\n';
  process.stdout.write(prompt);

  for await (const line of console) {
    try {
      const lexer = new Lexer(line);
      const tokens = lexer.lex();
      const parser = new Parser(tokens);
      const statements = parser.parse();

      interpreter.interpret(statements);
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

if (process.versions.bun) {
  run();
}

export { run };
