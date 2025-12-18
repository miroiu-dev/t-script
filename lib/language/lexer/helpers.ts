const HEX_DIGIT = /[0-9a-fA-F]/;

function isNewLine(character: string): boolean {
  return character === '\n';
}

function isDigit(character: string): boolean {
  return character >= '0' && character <= '9';
}

function isBackslash(character: string): boolean {
  return character === '\\';
}

function isHexDigit(char: string): boolean {
  return HEX_DIGIT.test(char);
}

function isAlpha(character: string): boolean {
  return (
    (character >= 'a' && character <= 'z') ||
    (character >= 'A' && character <= 'Z') ||
    character === '_' ||
    character === '$'
  );
}

function isAlphaNumeric(character: string): boolean {
  return isAlpha(character) || isDigit(character);
}

export { isAlpha, isAlphaNumeric, isBackslash, isDigit, isHexDigit, isNewLine };
