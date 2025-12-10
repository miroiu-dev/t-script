class LexerError extends Error {
  constructor(
    message: string,
    public line: number,
    public column: number
  ) {
    super(`Error: Unexpected "${message}" at ${line}:${column}`);
    this.name = 'LexerError';
  }
}

export { LexerError };
