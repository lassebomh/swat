export interface ASM {
  asm(): string;
}

export interface Item extends ASM {
  item: true;
  type: string;
}

export class LocalDefine implements ASM {
  constructor(public type: string, public name: string) {}

  asm(): string {
    return `(local $${this.name} ${this.type})`;
  }
}

export class LocalGet implements Item {
  item = true as const;

  constructor(public definition: LocalDefine | FunctionParam) {}

  public get type() {
    return this.definition.type;
  }

  asm(): string {
    return `local.get $${this.definition.name}`;
  }
}

export class Const implements Item {
  item = true as const;

  constructor(public type: string, public value: string) {}

  asm(): string {
    return `${this.type}.const ${this.value}`;
  }
}

export class TernaryOp implements ASM, Item {
  item = true as const;
  type: string;

  constructor(public a: Item, public b: Item, public operator: string) {
    if (a.type !== b.type) throw new Error("Types do not match");
    this.type = a.type;
  }

  asm(): string {
    return (
      this.a.asm() +
      "\n" +
      this.b.asm() +
      "\n" +
      `${this.a.type}.${this.operator}`
    );
  }
}

export class Module implements ASM {
  // imports
  // functions
  // exports

  constructor() {}

  asm(): string {
    return `(module)`;
  }
}

export class FunctionParam implements ASM {
  constructor(public type: string, public name: string) {}

  asm(): string {
    return `(param $${this.name} ${this.type})`;
  }
}

export class Function implements ASM {
  constructor(
    public name: string,
    public params: FunctionParam[],
    public returnType: string,
    public code: ASM[] = []
  ) {}

  asm(): string {
    return (
      `(func $${this.name}\n` +
      " ".concat(...this.params.map((param) => param.asm())) +
      "\n" +
      `(result ${this.returnType})\n` +
      "\n".concat(...this.code.map((x) => x.asm())) +
      "\n" +
      ")"
    );
  }
}
