import {
  Scope,
  Node,
  FunctionDeclaration,
  VariableDeclaration,
  VariableAssignment,
  FunctionReturn,
  Module,
  FunctionSignature,
  VariableSignature,
  ImportModule,
} from "./types";
import * as tk from "../tokenizer";
import { inspect, ok } from "../utils";
import { parseVariableAssignment, parseVariableSignature } from "./variable";
import { parseExpressions } from "./expressions";
import { parseFunction, parseFunctionSignature } from "./function";

export function parseModule(tokens: tk.Token[], i: number = 0): Module {
  let t: tk.Token;

  let module = new Module();

  while (i < tokens.length) {
    t = tokens[i++];

    let exported = false;

    if (tk.Keyword.as(t, "import")) {
      const importModule = new ImportModule();

      t = tokens[i++];
      ok(tk.Delimiter.as(t, "{"));

      while (true) {
        t = tokens[i];
        if (tk.Delimiter.as(t, "}")) break;

        if (tk.Keyword.as(t, "func")) {
          let funcSign: FunctionSignature;
          [funcSign, i] = parseFunctionSignature(tokens, i);

          importModule.functions.set(funcSign.name, funcSign);
        } else if (tk.Keyword.as(t, "var")) {
          let varSign: VariableSignature;
          [varSign, i] = parseVariableSignature(tokens, i, true);

          importModule.variables.set(varSign.name, varSign);
        } else {
          throw new Error(`Unknown import token ${t.value}`);
        }

        t = tokens[i++];
        if (!tk.Operator.as(t, ",")) break;
      }

      t = tokens[i++];
      ok(tk.Keyword.as(t, "from"));

      t = tokens[i++];
      ok(t instanceof tk.Identifier);

      const name = t.value;

      t = tokens[i++];
      ok(tk.Delimiter.as(t, ";"));

      module.importedModules.set(name, importModule);
    } else {
      if (tk.Keyword.as(t, "export")) {
        exported = true;
        t = tokens[i];
      }

      if (tk.Keyword.as(t, "func")) {
        let funcDecl: FunctionDeclaration;
        [funcDecl, i] = parseFunction(tokens, i, module, exported);
        module.functions.set(funcDecl.signature.name, funcDecl);
      } else {
        throw new Error(`Unhandled token ${t.value}`);
      }
    }
  }

  return module;
}

// let i = 0;
// let tokens = new tk.Lexer(`
// export func MAIN(i32 a, i32 b) i32 {
//     var c i32;
//     c = 123;
// }
// export func HEY(i32 a, i32 b) i32 {
//     var c i32;
//     c = 123;
// }
// `).tokenize();

// let module = parseModule(tokens);

// // inspect(module);
