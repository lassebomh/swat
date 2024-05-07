// while (true) {
//   let expression;

//   [expression, i] = syard(tokens, i);

//   t = tokens[i++];
//   ok(tk.Delimiter.as(t, ";"));

//   expressions = [...expressions, ...expression];

//   t = tokens[i];

//   if (tk.Delimiter.as(t, "}")) {
//     break;
//   }
// }

// const lexer = new tk.Lexer(`
// func MAIN ( i32 a, i32 b ) i32 {
//     a + b * 3;
// }
// `);
// const tokens = lexer.tokenize();

// const ast = parseFunction(tokens);

// inferType(ast, { type: undefined, children: [], getLocal: (name) => undefined });
// inspect(ast);

// log(toWat(ast));

// // 3 + 2 * a
