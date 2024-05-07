import { inspect } from "../utils";

export interface Node {}

export interface Value extends Node {
  type: string | undefined;
}

export class Constant implements Value {
  constructor(
    public value: string,
    public type: string | undefined = undefined
  ) {}
}

export interface Scope extends Node {
  parent: Scope;
  getLocalSignature(name: string): VariableSignature | undefined;
  getFunctionSignature(name: string): FunctionSignature | undefined;
}

export class Variable implements Value {
  constructor(public sig: VariableSignature) {}
  get type(): string {
    return this.sig.type;
  }
}

export class VariableSignature implements Node {
  constructor(
    public name: string,
    public type: string,
    public global: boolean
  ) {}
}

export class VariableDeclaration implements Node {
  children = [];
  constructor(public signature: VariableSignature) {}
}

export class VariableAssignment implements Node {
  constructor(public name: string, public children: Node[]) {}
}

export class FunctionSignature {
  constructor(
    public name: string,
    public returnType: string,
    public args: Map<string, VariableSignature>
  ) {}
}
export class FunctionDeclaration implements Scope {
  constructor(
    public signature: FunctionSignature,
    public children: Node[],
    public variables: Map<string, VariableSignature>,
    public parent: Module,
    public exported: boolean
  ) {}

  getLocalSignature(name: string): VariableSignature | undefined {
    return (
      this.variables.get(name) ??
      this.signature.args.get(name) ??
      this.parent.getLocalSignature(name)
    );
  }

  getFunctionSignature(name: string): FunctionSignature | undefined {
    return this.parent.getFunctionSignature(name);
  }
}

export class FunctionReturn implements Node {
  constructor(public type: string, public children: Node[]) {}
}

export abstract class Operator implements Value {
  constructor(
    public children: Value[],
    public precedence: number,
    public leftAssoc: boolean,
    public args: number,
    public type: string | undefined = undefined,
    public inputTypes: string[] | undefined = undefined,
    public polymorphic: boolean = false
  ) {}
}

export class SeperatorOperator extends Operator {
  constructor(children) {
    super(children, 0, false, 0);
  }
}

export class AddOperator extends Operator {
  constructor(children) {
    super(children, 2, true, 2);
  }
}
export class SubtractOperator extends Operator {
  constructor(children) {
    super(children, 2, true, 2);
  }
}

export class MultiplyOperator extends Operator {
  constructor(children) {
    super(children, 3, true, 2);
  }
}

export class DivideOperator extends Operator {
  constructor(children) {
    super(children, 3, true, 2);
  }
}
export class Call extends Operator {
  constructor(public func: FunctionSignature, children) {
    let args = [...func.args.values()].map((sig) => sig.type);
    super(
      children,
      6,
      true,
      args.length + 1,
      func.returnType,
      ["funcref", ...args],
      true
    );
  }
}

export class Function implements Value {
  public type = "funcref";
  constructor(public name: string) {}
}

export class ImportModule {
  constructor(
    public variables: Map<string, VariableSignature> = new Map(),
    public functions: Map<string, FunctionSignature> = new Map()
  ) {}
}

export class Module implements Scope {
  constructor(
    public parent: Scope = <any>undefined,
    public variables: Map<string, VariableDeclaration> = new Map(),
    public functions: Map<string, FunctionDeclaration> = new Map(),
    public importedModules: Map<string, ImportModule> = new Map()
  ) {}

  getLocalSignature(name: string): VariableSignature | undefined {
    let sig = this.variables.get(name)?.signature;
    if (sig) return sig;
    for (const importModule of this.importedModules.values()) {
      if (importModule.variables.has(name)) {
        return importModule.variables.get(name);
      }
    }
  }
  getFunctionSignature(name: string): FunctionSignature | undefined {
    let sig = this.functions.get(name)?.signature;
    if (sig) return sig;
    for (const importModule of this.importedModules.values()) {
      if (importModule.functions.has(name)) {
        return importModule.functions.get(name);
      }
    }
  }
}
