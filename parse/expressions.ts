import {
  AddOperator,
  Function,
  Constant,
  DivideOperator,
  MultiplyOperator,
  Node,
  SeperatorOperator,
  SubtractOperator,
  Operator,
  Variable,
  Call,
  Scope,
  FunctionDeclaration,
  Value,
  Module,
} from "./types";
import * as tk from "../tokenizer";
import { equal, inspect, log } from "../utils";

export function inferTypes(nodes: Value[], types: string[]) {
  equal(nodes.length, types.length, "Mismatched number of arguments");

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const type = types[i];

    if (!node.type) {
      node.type = type;
    } else {
      equal(node.type, type, "Mismatched types.");
    }
    if (node instanceof Operator) {
      if (node.inputTypes === undefined) {
        if (!node.polymorphic) {
          node.inputTypes = Array(node.args).fill(node.type);
        } else {
          throw new Error("Not handled");
        }
      }
      inferTypes(node.children, node.inputTypes);
    }
  }
}

export function parseExpressions(
  tokens: tk.Token[],
  i: number = 0,
  scope: Scope,
  types: string[]
): [Node[], number] {
  const stack: Value[] = [];
  const opstack: Operator[] = [];

  let hitEndToken = false;

  while (i < tokens.length) {
    let token = tokens[i];
    let node: Node;

    if (token instanceof tk.Number) {
      node = new Constant(token.value);
    } else if (token instanceof tk.Identifier) {
      const sig = scope.getLocalSignature(token.value);
      if (!sig) throw new Error(`${token.value} doesn't exist.`);
      node = new Variable(sig);
    } else if (token instanceof tk.Function) {
      node = new Function(token.value);
    } else if (token instanceof tk.Operator) {
      switch (token.value) {
        case "+":
          node = new AddOperator([]);
          break;
        case "-":
          node = new SubtractOperator([]);
          break;
        case "*":
          node = new MultiplyOperator([]);
          break;
        case "/":
          node = new DivideOperator([]);
          break;
        case ",":
          node = new SeperatorOperator([]);
          break;
        default:
          throw new Error(`Unknown operator ${token.value}`);
      }
    } else if (token instanceof tk.Delimiter) {
      switch (token.value) {
        case "(":
          const prevToken = tokens[i - 1];
          const isCall = prevToken instanceof tk.Function;
          let nodes: Node[];
          if (isCall) {
            let funcSig = scope.getFunctionSignature(prevToken.value);
            if (!funcSig)
              throw new Error(`Function ${prevToken.value} is not defined`);

            [nodes, i] = parseExpressions(
              tokens,
              i + 1,
              scope,
              [...funcSig.args.values()].map((sig) => sig.type)
            );
            node = new Call(funcSig, nodes);
          } else {
            [nodes, i] = parseExpressions(tokens, i + 1, scope, types);
            if (nodes.length > 1) {
              throw new Error("Expression contains multiple values.");
            }
            node = nodes[0];
          }
          break;
        case ")":
        case ";":
          hitEndToken = true;
          node = <any>undefined;
          break;
        default:
          throw new Error(`Unknown delimiter ${token.value}`);
      }
    } else {
      throw new Error(`Unknown token ${token}`);
    }

    if (hitEndToken) {
      break;
    }

    if (!(node instanceof Operator && node.children.length === 0)) {
      stack.push(<Value>node);
    } else if (node instanceof SeperatorOperator) {
      while (opstack.length > 0) {
        stack.push(opstack.pop()!);
      }
    } else if (node instanceof Operator) {
      while (
        opstack.length > 0 &&
        (opstack.at(-1)!.precedence > node.precedence ||
          (opstack.at(-1)!.precedence == node.precedence && node.leftAssoc))
      ) {
        stack.push(opstack.pop()!);
      }
      opstack.push(node);
    }

    i++;
  }

  while (opstack.length > 0) {
    stack.push(opstack.pop()!);
  }

  let ii = 0;

  while (ii < stack.length) {
    const node = stack[ii];

    if (node instanceof Operator) {
      let takes = node.args - node.children.length;
      ii -= takes;

      const splice = stack.splice(ii, takes);

      if (!node.polymorphic) {
        const typeSet = new Set<string>();

        for (const child of splice) {
          if (child.type) typeSet.add(child.type);
        }

        let types = [...typeSet.keys()];

        if (types.length == 1) {
          for (const child of splice) {
            child.type = types[0];
          }
          node.inputTypes = Array(node.args).fill(types[0]);
          node.type = types[0];
        } else if (types.length > 1) {
          throw new Error("Failed to infer type");
        }
      }

      node.children.unshift(...splice);
    }

    ii++;
  }

  inferTypes(stack, types);

  return [stack, i];
}

// const module = new Module();

// let i = 0;
// let tokens = new tk.Lexer(`
// 1 + 2 * x;
// `).tokenize();

// const func = new FunctionDeclaration(
//   "MAIN",
//   "i64",
//   [],
//   new Map(),
//   new Map([["x", "i64"]]),
//   module,
//   false
// );

// // inspect(parseExpressions(tokens, i, func, [func.returnType])[0]);
