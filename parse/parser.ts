import { Scope, Node, Operator, Variable, FunctionDeclaration } from "./types";

function inferType(node: Node, scope: Scope): string | undefined {
  if (node instanceof Variable) {
    node.type = scope.getLocal(node.name);
    return node.type;
  } else if (node instanceof Operator) {
    let typeSet = new Set<string>();

    for (const child of node.children) {
      let type = inferType(child, scope);
      if (type) typeSet.add(type);
    }

    let types = [...typeSet.keys()];

    if (types.length == 1) {
      for (const child of node.children) {
        child.type = types[0];
      }
      node.type = types[0];
      return types[0];
    } else if (types.length > 1) {
      throw new Error("Failed to infer type");
    }

    return undefined;
  } else if (node instanceof FunctionDeclaration) {
    for (const child of node.children) {
      inferType(child, node);
    }

    return undefined;
  }

  throw new Error(`Unhandled node type ${node}`);
}
