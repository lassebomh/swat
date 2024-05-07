import * as tk from "../tokenizer";
import { inspect, ok } from "../utils";
import { print as printWasm } from "watr";
import {
  AddOperator,
  Constant,
  DivideOperator,
  FunctionDeclaration,
  MultiplyOperator,
  Operator,
  Scope,
  SubtractOperator,
  Variable,
  Node,
  parseFunction,
  VariableDeclaration,
  VariableAssignment,
  Module,
  FunctionReturn,
  Call,
} from "../parse";
import { parseModule } from "../parse/module";

export function compileWat(node: Node, parent?: Scope): string {
  if (node instanceof Module) {
    let imports: string[] = [];

    for (const [moduleName, module] of node.importedModules.entries()) {
      for (const func of module.functions.values()) {
        const argsWat = Array.from(func.args.values()).map(
          (sig) => `(param $${sig.name} ${sig.type})`
        );
        const signature = `(import "${moduleName}" "${func.name}" (func $${
          func.name
        } ${argsWat.join(" ")} (result ${func.returnType})))`;

        imports.push(signature);
      }
      for (const vardecl of module.variables.values()) {
        const signature = `(import "${moduleName}" "${vardecl.name}" (global $${vardecl.name} ${vardecl.type}))`;

        imports.push(signature);
      }
    }

    const funcsWat = [...node.functions.values()].map((funcdef) =>
      compileWat(funcdef, node)
    );

    return `(module\n` + [...imports, ...funcsWat].join("\n") + "\n)";
  } else if (node instanceof FunctionDeclaration) {
    const argsWat = Array.from(node.signature.args.values()).map(
      (sig) => `(param $${sig.name} ${sig.type})`
    );

    const signature = `(func $${node.signature.name} ${argsWat.join(
      " "
    )} (result ${node.signature.returnType})\n`;

    const childrenWat = node.children.map((child) => compileWat(child, parent));

    return (
      signature +
      childrenWat.join("\n") +
      "\n)" +
      (node.exported
        ? `\n(export "${node.signature.name}" (func $${node.signature.name}))`
        : "")
    );
  } else if (node instanceof VariableDeclaration) {
    return `(local $${node.signature.name} ${node.signature.type})`;
  } else if (node instanceof VariableAssignment) {
    const childrenWat = node.children.map((child) => compileWat(child, parent));
    return childrenWat.join("\n") + "\n" + "local.set $" + node.name;
  } else if (node instanceof Call) {
    return (
      node.children
        .slice(1)
        .map((child) => compileWat(child, parent))
        .join("\n") +
      "\n" +
      `call $${node.func.name}`
    );
  } else if (node instanceof Operator) {
    let operationName: string;

    if (node instanceof AddOperator) {
      operationName = "add";
    } else if (node instanceof MultiplyOperator) {
      operationName = "mul";
    } else if (node instanceof DivideOperator) {
      operationName = "div";
    } else if (node instanceof SubtractOperator) {
      operationName = "sub";
    } else {
      throw new Error(`Unhandled operator type ${node}`);
    }

    return (
      node.children.map((child) => compileWat(child, parent)).join("\n") +
      "\n" +
      `${node.type}.${operationName}`
    );
  } else if (node instanceof Variable) {
    return `${node.sig.global ? "global" : "local"}.get $${node.sig.name}`;
  } else if (node instanceof Constant) {
    return node.type + ".const " + node.value;
  } else if (node instanceof FunctionReturn) {
    return (
      node.children.map((child) => compileWat(child, parent)).join("\n") +
      "\n" +
      "return"
    );
  }

  throw new Error(`Unhandled node ${node.constructor}`);
}
