export const _number = "0123456789";
export const _letter_lower = "abcdefghijklmnopqrstuvwxyz";
export const _letter_upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const _letter = _letter_lower + _letter_upper;
export const _alpha = _letter + _number;
export const _eol = "\n\r";
export const _whitespace = "\t ";
export const _operator = "=+-/*%";
export const _special = "(){},;";
export const _keywords = ["break", "return", "var", "fn"];

export const _operator_levels = {
  "*": 1,
  "/": 1,
  "+": 0,
  "-": 0,
};

export const _operator_names = {
  "*": "mul",
  "/": "div",
  "+": "add",
  "-": "sub",
};

export enum TokenType {
  Operator = "Operator",
  Identifier = "Identifier",
  Constant = "Constant",
  SpecialCharacter = "SpecialCharacter",
  Keyword = "Keyword",
}

export type Token = {
  type: TokenType;
  value: string;
  eol: boolean;
};

export class Scope {
  constructor(
    private parent?: Scope,
    private variableDefinitions: Map<string, string> = new Map()
  ) {}

  public createChild(): Scope {
    return new Scope(this);
  }

  public getVariable(name: string): string | undefined {
    let type = this.variables.get(name);
    if (type === undefined && this.parent !== undefined) {
      return this.parent.getVariable(name);
    }
    return type;
  }

  public setVariable(name: string, type: string) {
    this.variables.set(name, type);
  }
}
