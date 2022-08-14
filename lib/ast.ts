type AstType = "function" | "signature" | "branch" | "loop" | "statement";

export interface AstBase {
  path: string;
  type: AstType;
}

export interface SignatureAst extends AstBase {
  text: string;
}

export interface FunctionAst extends AstBase {
  signature: SignatureAst;
  body: Ast[];
}

export interface StatementAst extends AstBase {
  text: string;
}

export interface LoopAst extends AstBase {
  condition?: string;
  body: Ast[];
}

export interface BranchAst extends AstBase {
  condition?: string;
  ifBranch?: Ast[];
  elseBranch?: Ast[];
}

export type Ast =
  | FunctionAst
  | SignatureAst
  | BranchAst
  | LoopAst
  | StatementAst;

const get = (scope: string[], ast: Ast) =>
  scope[0] === "" ? ast : scope.reduce((acc: any, curr) => acc[curr], ast);

const grandParent = (scope: string[], ast: Ast) => {
  const parent = scope.slice(0, -2);
  return parent.reduce((acc: any, curr) => acc[curr], ast);
};

const isOnIfBranch = (scope: string[]) => scope.at(-2) === "ifBranch";

const swapBranch = (scope: string[], ast: Ast) => {
  const parent = grandParent(scope, ast);
  const otherBranch = isOnIfBranch(scope) ? "elseBranch" : "ifBranch";
  const index = scopeIndex(scope);
  const { length } = parent[otherBranch];

  const branchScope = scope.slice(0, -2);
  return [...branchScope, otherBranch, Math.min(index, length - 1).toString()];
};

/**
 * @deprecated DONT USE THIS
 */
const getBody = (ast: any | Ast) => {
  switch (ast.type) {
    case "function":
    case "loop":
      return ast.body;
    case "branch":
      return ast.ifBranch;
  }
};

const isLast = (scope: string[], ast: Ast) => {
  const last = scope.at(-1);
  const parent = grandParent(scope, ast);
  const { length } = getBody(parent);
  const nextNumber = Number(last) + 1;
  return nextNumber >= length;
};

const isLeaf = (scope: string[], ast: Ast) => {
  if (!isLast(scope, ast)) {
    return false;
  }
  const parent = grandParent(scope, ast);
  if (parent.type === "function") {
    return true;
  }

  const parentScope = parent.path.split(".");
  return isLast(parentScope, ast);
};

const setIndex = (path: string, index: number) =>
  path.split(".").slice(0, -1).concat(index.toString()).join(".");

const insert = (body: Ast[], index: number, node: Ast) => {
  const oldPath = body[index].path;
  return [...body.slice(0, index + 1), node, ...body.slice(index + 1)].map(
    (node, i) =>
      ({
        ...node,
        path: setIndex(oldPath, i),
      } as Ast)
  );
};

const scopeIndex = (scope: string[]) => Number(scope.at(-1)!);

const withScope = (scope: string[], ast: any): any => {
  const [first, ...rest] = scope;
  if (rest.length === 0) {
    return { [first]: ast };
  }
  return {
    [first]: withScope(rest, ast),
  };
};

const incrementScope = (scope: string[]) => {
  const last = Number(scope.at(-1));
  //if last is a number
  if (!isNaN(last)) {
    return scope.slice(0, -1).concat((last + 1).toString());
  }
  return scope.concat("0");
};

const prepare = (scope: string[], node: Ast): Ast => {
  const path = incrementScope(scope).join(".");
  switch (node.type) {
    case "branch":
      return {
        ...node,
        path,
        ifBranch: [
          { type: "statement", path: `${path}.ifBranch.0`, text: " " },
        ],
        elseBranch: [
          { type: "statement", path: `${path}.elseBranch.0`, text: " " },
        ],
      } as Ast;
    case "loop":
      return {
        ...node,
        path,
        body: [{ type: "statement", path: `${path}.body.0`, text: " " }],
      } as Ast;
  }

  //TODO: remove this
  return node;
};

const createBody = (scope: string[], ast: Ast, node: Ast) => {
  const parent = grandParent(scope, ast);
  const parentBody = getBody(parent);
  const index = scopeIndex(scope);
  return insert(parentBody, index, node);
};

const correctPaths = (ast: Ast): Ast => {
  const newAst = structuredClone(ast);
  newAst.body = newAst.body.map((node: Ast, index: number) =>
    correctPathsHelper(["body", index.toString()], node)
  );

  return newAst;
};

const correctPathsHelper = (scope: string[], ast: Ast): Ast => {
  const path = scope.join(".");

  switch (ast.type) {
    case "branch":
      const { ifBranch, elseBranch } = ast as BranchAst;
      return {
        ...ast,
        path,
        ifBranch: ifBranch?.map((child, index) =>
          correctPathsHelper(
            setIndex(`${path}.ifBranch.0`, index).split("."), //this might be scope.concat(["ifBranch", index.toString()]), could make a function for this
            child
          )
        ),
        elseBranch: elseBranch?.map((child, index) =>
          correctPathsHelper(
            setIndex(`${path}.elseBranch.0`, index).split("."),
            child
          )
        ),
      };
    case "loop":
      const { body } = ast as LoopAst;

      return {
        ...ast,
        path,
        body: body.map((child, index) =>
          correctPathsHelper(
            setIndex(`${path}.body.0`, index).split("."),
            child
          )
        ),
      };
    default:
      return { ...ast, path: scope.join(".") };
  }
};
const removeFromBody = (scope: string[], ast: Ast) => {
  const parent = grandParent(scope, ast);
  const last = scope.at(-2)!;
  const parentBody = parent[last];
  const index = scopeIndex(scope);

  const newBody = parentBody
    .slice(0, index)
    .concat(parentBody.slice(index + 1));
  return newBody;
};

const setBody = (scope: string[], ast: Ast, body: Ast[]) => {
  const parent = grandParent(scope, ast);
  const newAst = structuredClone(ast);
  const parentScope = parent.path.split(".");
  const bodyName = scope.at(-2)!;
  get(parentScope, newAst)[bodyName] = body;
  return correctPaths(newAst);
};

const set = (scope: string[], ast: Ast, node: Ast): Ast => {
  const newAst = structuredClone(ast);
  get(scope.slice(0, -1), newAst)[scope.at(-1)!] = node;
  return newAst;
};

const isAddingToPlaceholder = (scope: string[], ast: Ast, node: Ast) => {
  if (node.type === "branch" || node.type === "loop") {
    const inScope = get(scope, ast);

    return inScope.type === "statement" && inScope.text === " ";
  }
  return false;
};

export const up = (scope: string[], ast: Ast): string[] => {
  const last = scope.at(-1);
  if (last === "0") {
    const { type } = grandParent(scope, ast);
    switch (type) {
      case "function":
        return scope.slice(0, -2).concat("signature");
      case "branch":
        return scope.slice(0, -2);
      default:
        return scope.slice(0, -2);
    }
  }

  switch (last) {
    case "signature":
      return scope;

    //number
    default:
      const newScope = scope.slice(0, -1).concat((Number(last) - 1).toString());
      const node = get(newScope, ast);
      if (node.type === "branch") {
        return node.ifBranch.at(-1).path.split(".");
      }
      if (node.type === "loop") {
        return node.body.at(-1).path.split(".");
      }

      return newScope;
  }
};

export const down = (scope: string[], ast: Ast): string[] => {
  const { type } = get(scope, ast);
  switch (type) {
    case "signature":
      return scope.slice(0, -1).concat(["body", "0"]);
    case "branch":
      return [...scope, "ifBranch", "0"];
    case "loop":
      return [...scope, "body", "0"];

    default:
      if (!isLast(scope, ast)) return incrementScope(scope);

      const parent = grandParent(scope, ast);
      const parentScope = parent.path.split(".");

      return isLeaf(scope, ast) ? scope : incrementScope(parentScope);
  }
};

export const left = (scope: string[], ast: Ast) => {
  const { type } = grandParent(scope, ast);
  switch (type) {
    case "loop":
      return scope.slice(0, -2);
    default:
      const parent = grandParent(scope, ast);
      if (parent.type === "branch" && !isOnIfBranch(scope)) {
        return swapBranch(scope, ast);
      }
      return scope;
  }
};

export const right = (scope: string[], ast: Ast) => {
  const { type } = get(scope, ast);
  switch (type) {
    case "loop":
      return scope;
    default:
      const parent = grandParent(scope, ast);
      if (parent.type === "branch" && isOnIfBranch(scope)) {
        return swapBranch(scope, ast);
      }
      return scope;
  }
};

export const remove = (scope: string[], ast: Ast) => {
  const newBody = removeFromBody(scope, ast);
  const newAst = setBody(scope, ast, newBody);

  return { scope: scope, ast: newAst };
};

export const add = (
  scope: string[],
  ast: Ast,
  node: Ast
): { scope: string[]; ast: Ast } => {
  if (scope.at(-1) === "signature") return { scope, ast };

  const newNode = prepare(scope, node);
  const newBody = createBody(scope, ast, newNode);
  const newAst = setBody(scope, ast, newBody);
  const newScope = down(scope, newAst);

  if (isAddingToPlaceholder(scope, ast, node)) {
    return remove(scope, newAst);
  }
  return { scope: newScope, ast: newAst };
};

export const edit = (
  scope: string[],
  ast: Ast,
  textTransform: (text?: string) => string | undefined
) => {
  const node = get(scope, ast);
  const newNode = { ...node, text: textTransform(node.text) };
  const newAst = set(scope, ast, newNode);
  return { scope, ast: newAst };
};
