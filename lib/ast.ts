type AstType = 'function' | 'signature' | 'branch' | 'loop' | 'statement';

export interface AstBase {
  path: string;
  type: AstType;
}

export type Variable = { type: 'variable'; name: string };
export type Subscript = { type: 'subscript'; text: AbstractText };
export type SuperScript = { type: 'superscript'; text: AbstractText };
export type MathBB = { type: 'mathbb'; value: 'S' | 'R' | 'N' | 'Z' | 'B' };

export type InsertInsideAvailable = SuperScript | Subscript;

export type Operator = {
  type:
    | 'and'
    | 'or'
    | 'eq'
    | 'lt'
    | 'gt'
    | 'colon'
    | 'comma'
    | 'semicolon'
    | 'lp'
    | 'rp'
    | 'lb'
    | 'rb'
    | 'lc'
    | 'rc'
    | 'star'
    | 'bang'
    | 'space'
    | 'minus';
};
export type Symbol = {
  type:
    | 'epsilon'
    | 'pi'
    | 'in'
    | 'infinity'
    | 'forall'
    | 'exists'
    | 'land'
    | 'lor'
    | 'lnot'
    | 'neq'
    | 'ge'
    | 'le'
    | 'coloneq'
    | 'arrow'
    | 'times'
    | 'empty';
};

export type AbstractChar =
  | Operator
  | Symbol
  | Variable
  | Subscript
  | SuperScript
  | MathBB;

export type AbstractText = AbstractChar[];

export interface SignatureAst extends AstBase {
  text: AbstractText;
}

export interface FunctionAst extends AstBase {
  signature: SignatureAst;
  body: AstNode[];
}

export interface StatementAst extends AstBase {
  text: AbstractText;
}

export interface LoopAst extends AstBase {
  text: AbstractText;
  body: AstNode[];
}

export interface BranchAst extends AstBase {
  text: AbstractText;
  ifBranch: AstNode[];
  elseBranch: AstNode[];
}

export type Ast =
  | FunctionAst
  | SignatureAst
  | BranchAst
  | LoopAst
  | StatementAst;

export type AstNode = Exclude<Ast, FunctionAst>;

type Scope = string[];

export type CST = {
  ast: Ast;
  scope: Scope;
};

export const get = (scope: Scope, ast: Ast) =>
  scope[0] === '' ? ast : scope.reduce((acc: any, curr) => acc[curr], ast);

const grandParent = (scope: Scope, ast: Ast) => {
  const parent = scope.slice(0, -2);
  return parent.length === 0
    ? ast
    : parent.reduce((acc: any, curr) => acc[curr], ast);
};

const isOnSignature = (scope: Scope) => {
  return scope[0] === 'signature';
};

const isOnIfBranch = (scope: Scope) => scope.at(-2) === 'ifBranch';

const swapBranch = (scope: Scope, ast: Ast) => {
  const parent = grandParent(scope, ast);
  const otherBranch = isOnIfBranch(scope) ? 'elseBranch' : 'ifBranch';
  const index = scopeIndex(scope);
  const { length } = parent[otherBranch];

  const branchScope = scope.slice(0, -2);
  return [...branchScope, otherBranch, Math.min(index, length - 1).toString()];
};

const getBody = (scope: Scope, ast: any | Ast) => {
  switch (ast.type) {
    case 'function':
    case 'loop':
      return ast.body;
    case 'branch':
      const last = scope.at(-2)!;
      return ast[last];
  }
};

const isLast = (scope: Scope, ast: Ast) => {
  const last = scope.at(-1);
  const parent = grandParent(scope, ast);
  const { length } = getBody(scope, parent);
  const nextNumber = Number(last) + 1;
  return nextNumber >= length;
};

const isLeaf = (scope: Scope, ast: Ast, depth = 0): boolean => {
  const parent = grandParent(scope, ast);
  const { length } = getBody(scope, parent);
  const last = scope.at(-1);
  const nextNumber = Number(last) + 1;
  const isTheLast = nextNumber >= length;

  if (parent.type === 'function') {
    return isTheLast;
  }

  const parentScope = parent.path.split('.');
  return isTheLast && isLeaf(parentScope, ast, depth + 1);
};

const tryIncrementScope = (
  scope: Scope,
  ast: Ast,
  depth = 0,
  originalScope = scope,
): Scope => {
  const parent = grandParent(scope, ast);
  const { length } = getBody(scope, parent);
  const last = scope.at(-1);
  const nextNumber = Number(last) + 1;
  const isTheLast = nextNumber >= length;

  if (parent.type === 'function') {
    return isTheLast ? originalScope : incrementScope(scope);
  }

  const parentScope = parent.path.split('.');
  return !isTheLast
    ? incrementScope(scope)
    : tryIncrementScope(parentScope, ast, depth++, originalScope);
};

const setIndex = (path: string, index: number) =>
  path.split('.').slice(0, -1).concat(index.toString()).join('.');

const insert = (scope: Scope, body: Ast[], index: number, node: Ast) => {
  const oldPath = scope.join('.');
  if (index === -1) {
    return [node, ...body].map(
      (node, i) =>
        ({
          ...node,
          path: setIndex(oldPath, i),
        } as Ast),
    );
  }

  return [...body.slice(0, index + 1), node, ...body.slice(index + 1)].map(
    (node, i) =>
      ({
        ...node,
        path: setIndex(oldPath, i),
      } as Ast),
  );
};

const scopeIndex = (scope: Scope) =>
  isOnSignature(scope) ? -1 : Number(scope.at(-1)!);

const withScope = (scope: Scope, ast: any): any => {
  const [first, ...rest] = scope;
  if (rest.length === 0) {
    return { [first]: ast };
  }
  return {
    [first]: withScope(rest, ast),
  };
};

const incrementScope = (scope: Scope): Scope => {
  const last = Number(scope.at(-1));
  //if last is a number
  if (!isNaN(last)) {
    return scope.slice(0, -1).concat((last + 1).toString());
  }
  return scope.concat('0');
};

const incrementAt = (scope: Scope, ast: Ast, depth: number): Scope => {
  const parent = grandParent(scope, ast);
  const parentScope = parent.path.split('.');

  if (depth === 0) {
    return incrementScope(parentScope);
  }
  return incrementAt(parentScope, ast, depth - 1);
};

const prepare = (scope: Scope, node: Ast): Ast => {
  const path = incrementScope(scope).join('.');
  switch (node.type) {
    case 'branch':
      return {
        ...node,
        path,
        ifBranch: [{ type: 'statement', path: `${path}.ifBranch.0`, text: [] }],
        elseBranch: [
          { type: 'statement', path: `${path}.elseBranch.0`, text: [] },
        ],
      } as Ast;
    case 'loop':
      return {
        ...node,
        path,
        body: [{ type: 'statement', path: `${path}.body.0`, text: [] }],
      } as Ast;
  }

  //TODO: remove this
  return node;
};

const createBody = (scope: Scope, ast: Ast, node: Ast) => {
  const parent = grandParent(scope, ast);
  const parentBody = getBody(scope, parent);
  const index = scopeIndex(scope);
  return insert(scope, parentBody, index, node);
};

const correctPaths = (ast: Ast): Ast => {
  if (ast.type === 'signature') return ast;

  const newAst = structuredClone(ast);
  // @ts-ignore
  newAst.body = newAst.body.map((node: AstNode, index: number) =>
    correctPathsHelper(['body', index.toString()], node),
  );

  return newAst;
};

const correctPathsHelper = (scope: Scope, ast: AstNode): AstNode => {
  const path = scope.join('.');

  switch (ast.type) {
    case 'branch':
      const { ifBranch, elseBranch } = ast as BranchAst;
      return {
        ...ast,
        path,
        ifBranch: ifBranch.map((child, index) =>
          correctPathsHelper(
            setIndex(`${path}.ifBranch.0`, index).split('.'), //this might be scope.concat(["ifBranch", index.toString()]), could make a function for this
            child,
          ),
        ),
        elseBranch: elseBranch.map((child, index) =>
          correctPathsHelper(
            setIndex(`${path}.elseBranch.0`, index).split('.'),
            child,
          ),
        ),
      };
    case 'loop':
      const { body } = ast as LoopAst;

      return {
        ...ast,
        path,
        body: body.map((child, index) =>
          correctPathsHelper(
            setIndex(`${path}.body.0`, index).split('.'),
            child,
          ),
        ),
      };
    default:
      return { ...ast, path: scope.join('.') };
  }
};

const removeFromBody = (scope: Scope, ast: Ast) => {
  const parent = grandParent(scope, ast);
  const parentBody = getBody(scope, parent);
  const index = scopeIndex(scope);

  const newBody = parentBody
    .slice(0, index)
    .concat(parentBody.slice(index + 1));
  return newBody;
};

const setBody = (scope: Scope, ast: Ast, body: Ast[]) => {
  const parent = grandParent(scope, ast);
  const newAst = structuredClone(ast);
  const parentScope = parent.path.split('.');
  const bodyName = scope.at(-2) || 'body';
  get(parentScope, newAst)[bodyName] = body;
  return correctPaths(newAst);
};

const set = (scope: Scope, ast: Ast, node: Ast): Ast => {
  const newAst = structuredClone(ast);
  get(scope.slice(0, -1), newAst)[scope.at(-1)!] = node;
  return newAst;
};

const isAddingToPlaceholder = (scope: Scope, ast: Ast, node: Ast) => {
  if (node.type === 'branch' || node.type === 'loop') {
    const inScope = get(scope, ast);

    return inScope.type === 'statement' && inScope.text === ' ';
  }
  return false;
};

const isOnCondition = (scope: Scope, ast: Ast) => {
  const current = get(scope, ast);
  return current.type === 'branch' || current.type === 'loop';
};

const getChildScopes = (scope: Scope, ast: Ast): Scope[] => {
  const node = get(scope, ast);
  switch (node.type) {
    case 'branch':
      const branch = node as BranchAst;
      return [
        scope,
        ...(branch.ifBranch?.flatMap((child) =>
          getChildScopes(child.path.split('.'), ast),
        ) || []),
        ...(branch.elseBranch?.flatMap((child) =>
          getChildScopes(child.path.split('.'), ast),
        ) || []),
      ];
    case 'loop':
      const loop = node as LoopAst;
      return [
        scope,
        ...(loop.body.flatMap((child) =>
          getChildScopes(child.path.split('.'), ast),
        ) || []),
      ];
    default:
      return [scope];
  }
};
export const up = (scope: Scope, ast: Ast): Scope => {
  const last = scope.at(-1);
  if (last === '0') {
    const { type } = grandParent(scope, ast);
    switch (type) {
      case 'function':
        return scope.slice(0, -2).concat('signature');
      case 'branch':
        return scope.slice(0, -2);
      default:
        return scope.slice(0, -2);
    }
  }

  switch (last) {
    case 'signature':
      return scope;

    //number
    default:
      const newScope = scope.slice(0, -1).concat((Number(last) - 1).toString());
      const node = get(newScope, ast);
      if (node.type === 'branch') {
        return node.ifBranch.at(-1).path.split('.');
      }
      if (node.type === 'loop') {
        return node.body.at(-1).path.split('.');
      }

      return newScope;
  }
};

export const traverse = <T, U = T extends Array<any> ? T : T[]>(
  ast: Ast,
  callback: (node: AstNode) => T,
): U => {
  switch (ast.type) {
    case 'function': {
      const { body, signature } = ast as FunctionAst;
      return [
        callback(signature),
        ...body.flatMap((child) => traverse(child, callback)),
      ].flat() as U;
    }
    case 'branch': {
      const { ifBranch, elseBranch } = ast as BranchAst;
      return [
        callback(ast as AstNode),
        ...ifBranch.flatMap((child) => traverse(child, callback)),
        ...elseBranch.flatMap((child) => traverse(child, callback)),
      ].flat() as U;
    }
    case 'loop': {
      const { body } = ast as LoopAst;
      return [
        callback(ast as AstNode),
        ...body.flatMap((child) => traverse(child, callback)),
      ].flat() as U;
    }
  }
  return [callback(ast as AstNode)].flat() as U;
};

export const down = (scope: Scope, ast: Ast): Scope => {
  if (isOnSignature(scope) && (ast as FunctionAst).body.length === 0) {
    return scope;
  }
  const { type } = get(scope, ast);
  switch (type) {
    case 'signature':
      return scope.slice(0, -1).concat(['body', '0']);
    case 'branch':
      return [...scope, 'ifBranch', '0'];
    case 'loop':
      return [...scope, 'body', '0'];

    default:
      if (!isLast(scope, ast)) return incrementScope(scope);

      return tryIncrementScope(scope, ast);
  }
};

export const left = (
  scope: Scope,
  ast: Ast,
  originalScope: Scope = scope,
): Scope => {
  const parent = grandParent(scope, ast);
  const parentScope = parent.path.split('.');
  switch (parent.type) {
    case 'loop':
      return scope.slice(0, -2);
    case 'branch': {
      if (isOnIfBranch(scope)) {
        const hitTheWall =
          left(parentScope, ast, originalScope) === originalScope;

        if (hitTheWall) {
          return originalScope;
        }

        const leftScope = left(parentScope, ast, originalScope);
        const leftNode = get(leftScope, ast);
        const newScope = down(leftScope, ast);

        return leftNode.type === 'branch' ? right(newScope, ast) : newScope;
      }

      return swapBranch(scope, ast);
    }

    default:
      return originalScope;
  }
};

export const right = (scope: Scope, ast: Ast, originalScope = scope): Scope => {
  const parent = grandParent(scope, ast);
  const parentScope = parent.path.split('.');

  switch (parent.type) {
    case 'function':
      return originalScope;
    case 'branch': {
      if (!isOnIfBranch(scope)) {
        const hitTheWall =
          right(parentScope, ast, originalScope) === originalScope;

        if (hitTheWall) {
          return originalScope;
        }

        return down(right(parentScope, ast, originalScope), ast);
      }

      return swapBranch(scope, ast);
    }

    default:
      return down(right(parentScope, ast), ast);
  }
};

export const remove = (scope: Scope, ast: Ast, strict = false): CST => {
  if (isOnSignature(scope)) return { scope, ast };

  if (strict) {
    const node = get(scope, ast);
    const parent = grandParent(scope, ast);
    const { length } = getBody(scope, parent);

    const isFirstNodeInBody = length === 1 && node.path.at(-1)! === '0';
    if (isFirstNodeInBody) {
      const firstStatementInLoopOrBranch =
        node.type === 'statement' &&
        (parent.type === 'loop' || parent.type === 'branch');

      if (firstStatementInLoopOrBranch) {
        // then do not remove it
        return { scope, ast };
      }

      const removed = remove(scope, ast);
      if (parent.type === 'function') {
        return removed;
      }

      return add(scope, removed.ast, {
        type: 'statement',
        text: [],
        path: '',
      });
    }
  }
  const newBody = removeFromBody(scope, ast);
  const newAst = setBody(scope, ast, newBody);

  return { scope: scope, ast: newAst };
};

export const add = (scope: Scope, ast: Ast, node: Ast): CST => {
  const newNode = prepare(scope, node);
  const newBody = createBody(scope, ast, newNode);
  const newAst = setBody(scope, ast, newBody);

  const newScope = isOnCondition(scope, newAst)
    ? incrementScope(scope)
    : down(scope, newAst);

  if (isAddingToPlaceholder(scope, ast, node)) {
    return remove(scope, newAst);
  }
  return { scope: newScope, ast: newAst };
};

export const edit = (
  scope: Scope,
  ast: Ast,
  textTransform: (text: AbstractText) => AbstractText,
): CST => {
  const node = get(scope, ast);
  const newNode = { ...node, text: textTransform(node.text) };
  const newAst = set(scope, ast, newNode);
  return { scope, ast: newAst };
};

export const isEmpty = (scope: Scope, ast: Ast) => {
  const { text } = get(scope, ast);
  return text.length === 0;
};

export const select = (
  selected: Set<string>,
  selection: Scope[],
  ast: Ast,
): Set<string> => {
  const newSet = new Set(selected);
  selection.forEach((scope) => {
    getChildScopes(scope, ast).forEach((child) => newSet.add(child.join('.')));
  });
  return newSet;
};

export const deselect = (
  selected: Set<string>,
  deselection: Scope[],
  ast: Ast,
): Set<string> => {
  const toDeselect = deselection
    .flatMap((scope) => getChildScopes(scope, ast))
    .map((path) => path.join('.'));

  const newSet = new Set(selected);
  toDeselect.forEach((path) => newSet.delete(path));
  return newSet;
};

export const navigateAndToggleSelection = (
  selected: Set<string>,
  scope: Scope,
  newScope: Scope,
  ast: Ast,
) => {
  const isNextSelected = selected.has(newScope.join('.'));
  if (isNextSelected) {
    //deselect
    const parent = grandParent(scope, ast);
    const isParentSelected = selected.has(parent.path);
    if (isParentSelected) {
      return { scope: newScope, selected };
    }

    return {
      scope: newScope,
      selected: deselect(selected, [scope], ast),
    };
  }

  //select
  return {
    scope: newScope,
    selected: select(selected, [scope, newScope], ast),
  };
};
