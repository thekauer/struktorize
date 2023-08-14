type AstType =
  | 'function'
  | 'signature'
  | 'branch'
  | 'switch'
  | 'case'
  | 'loop'
  | 'statement';

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

export interface CaseAst extends AstBase {
  text: AbstractText;
  body: AstNode[];
}

export interface SwitchAst extends AstBase {
  cases: CaseAst[];
}

export type Ast =
  | FunctionAst
  | SignatureAst
  | BranchAst
  | LoopAst
  | SwitchAst
  | CaseAst
  | StatementAst;

export type AstNode = Exclude<Ast, FunctionAst>;
export type TraversableAstNode = Exclude<AstNode, SwitchAst>;

type Scope = string[];

export type CST = {
  ast: Ast;
  scope: Scope;
};

export const get = (scope: Scope, ast: Ast) =>
  scope[0] === '' ? ast : scope.reduce((acc: any, curr) => acc[curr], ast);

const grandParent = (scope: Scope, ast: Ast) => {
  const isSwitch = scope.at(-2) === 'cases';
  const parent = isSwitch ? scope.slice(0, -4) : scope.slice(0, -2);
  return parent.length === 0
    ? ast
    : parent.reduce((acc: any, curr) => acc[curr], ast);
};

const isOnSignature = (scope: Scope) => {
  return scope[0] === 'signature';
};

const isOnIfBranch = (scope: Scope, ast: Ast) => {
  const parent = grandParent(scope, ast);
  return scope.at(parent.path.split('.').length) === 'ifBranch';
};

const swapBranch = (scope: Scope, ast: Ast) => {
  const parent = grandParent(scope, ast);
  const otherBranch = isOnIfBranch(scope, ast) ? 'elseBranch' : 'ifBranch';
  const index =
    scope.at(-2) === 'cases'
      ? scopeIndex(scope.slice(0, -2))
      : scopeIndex(scope);
  const { length } = parent[otherBranch];

  const branchScope = parent.path.split('.');
  return [...branchScope, otherBranch, Math.min(index, length - 1).toString()];
};

const getBodyName = (scope: Scope, ast: any | Ast) => {
  switch (ast.type) {
    case 'function':
    case 'loop':
      return 'body';
    case 'branch':
      const name = scope.at(-2)!;
      if (name !== 'ifBranch' && name !== 'elseBranch') return scope.at(-4)!;
      return name;
    case 'case':
      return 'body';
    case 'switch':
      return 'cases';
    default:
      return 'body';
  }
};

const getBody = (scope: Scope, ast: any | Ast) => {
  return ast[getBodyName(scope, ast)];
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

  if (parent.type === 'case') {
    const parentScope = parent.path.split('.').slice(0, -2);
    return !isTheLast
      ? incrementScope(scope)
      : tryIncrementScope(parentScope, ast, depth++, originalScope);
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
    case 'switch':
      return {
        ...node,
        path,
        cases: [
          {
            type: 'case',
            path: `${path}.cases.0`,
            text: [],
            body: [{ type: 'statement', path: `${path}.body.0`, text: [] }],
          },
          {
            type: 'case',
            path: `${path}.cases.1`,
            text: [],
            body: [{ type: 'statement', path: `${path}.body.0`, text: [] }],
          },
        ],
      } as Ast;
    case 'case':
      return {
        ...node,
        path,
        text: [],
        body: [{ type: 'statement', path: `${path}.cases.0.body.0`, text: [] }],
      } as Ast;
  }

  //TODO: remove this
  return node;
};

const getClosestSwitch = (scope: Scope, ast: Ast): SwitchAst | null => {
  if (!scope.includes('cases')) return null;
  if (scope.length < 2) return null;
  const parent = get(scope.slice(0, -2), ast);
  if (parent.type === 'switch') {
    return parent as SwitchAst;
  }
  return getClosestSwitch(parent.path.split('.'), ast);
};

const incrementCase = (scope: Scope, ast: Ast): Scope => {
  const parent = getClosestSwitch(scope, ast)!;
  const parentScope = parent.path.split('.');
  const max = parent.cases.length - 1;
  const index = scopeIndex(scope) + 1;

  return parentScope.concat('cases').concat(Math.min(max, index).toString());
};

const decrementCase = (scope: Scope): Scope => {
  const index = scopeIndex(scope) - 1;

  return scope.slice(0, -1).concat(Math.max(0, index).toString());
};

const createBody = (scope: Scope, ast: Ast, node: Ast) => {
  if (node.type === 'case') {
    const closestSwitch = getClosestSwitch(scope, ast)!;
    const body = closestSwitch.cases;
    const index = body.length;
    return insert(scope, body, index, node);
  }

  const parent = grandParent(scope, ast);
  const parentBody = getBody(scope, parent);
  const index = isOnSwitch(scope, ast)
    ? scopeIndex(scope.slice(0, -2))
    : scopeIndex(scope);
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
    case 'branch': {
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
    }

    case 'loop': {
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
    }

    case 'switch': {
      const { cases } = ast as SwitchAst;
      return {
        ...ast,
        path,
        cases: cases.map(
          (child, index) =>
            correctPathsHelper(
              setIndex(`${path}.cases.0`, index).split('.'),
              child,
            ) as CaseAst,
        ),
      };
    }

    case 'case': {
      const { body } = ast as CaseAst;
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
    }

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
  const bodyName = getBodyName(scope, parent);
  get(parentScope, newAst)[bodyName] = body;
  return correctPaths(newAst);
};

const set = (scope: Scope, ast: Ast, node: Ast | Ast[]): Ast => {
  const newAst = structuredClone(ast);
  get(scope.slice(0, -1), newAst)[scope.at(-1)!] = node;
  return newAst;
};

const addCase = (scope: Scope, ast: Ast, body: Ast[]) => {
  const parent = getClosestSwitch(scope, ast)!;
  const parentScope = parent.path.split('.').concat('cases');
  const newAst = set(parentScope, ast, body);
  return correctPaths(newAst);
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

const isOnSwitch = (scope: Scope, ast: Ast) => {
  const current = get(scope, ast);
  return current.type === 'case';
};

const isCaseOutsideSwitch = (scope: Scope, node: Ast) => {
  return node.type === 'case' && !scope.includes('cases');
};

const isCaseInsideSwitch = (scope: Scope, node: Ast) => {
  return node.type === 'case' && scope.includes('cases');
};

const getScopeAfterAdd = (scope: Scope, ast: Ast, node: Ast) => {
  if (node.type === 'case') {
    const switchAst = getClosestSwitch(scope, ast)!;
    const { length } = switchAst.cases;

    return switchAst.path.split('.').concat(['cases', (length - 1).toString()]);
  }
  if (isOnCondition(scope, ast)) return incrementScope(scope);
  if (isOnSwitch(scope, ast)) {
    const newScope = incrementScope(scope.slice(0, -2));
    if (node.type === 'switch') return newScope.concat('cases', '0');
    return newScope;
  }

  return down(scope, ast);
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

    case 'case': {
      const caseAst = node as CaseAst;
      return [
        scope,
        ...(caseAst.body.flatMap((child) =>
          getChildScopes(child.path.split('.'), ast),
        ) || []),
      ];
    }
    default:
      return [scope];
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
    case 'switch': {
      const { cases } = ast as SwitchAst;
      return [
        ...cases.flatMap((child) => traverse(child, callback)),
      ].flat() as U;
    }
    case 'case': {
      const { body } = ast as CaseAst;
      return [
        callback(ast as AstNode),
        ...body.flatMap((child) => traverse(child, callback)),
      ].flat() as U;
    }
  }
  return [callback(ast as AstNode)].flat() as U;
};

const movement = (
  move: (scope: Scope, ast: Ast, originalScope?: Scope) => Scope,
) => {
  return (scope: Scope, ast: Ast, originalScope: Scope = scope) => {
    const newScope = move(scope, ast, originalScope);
    const node = get(newScope, ast);
    if (node.type === 'switch') {
      return newScope.concat(['cases', '0']);
    }
    return newScope;
  };
};

export const up = movement((scope: Scope, ast: Ast): Scope => {
  const last = scope.at(-1);

  const current = get(scope, ast);
  if (current?.type === 'case') {
    const newScope = scope.slice(0, -2);
    const isTop = newScope.length === 0 || newScope.at(-1) === '0';
    const last = newScope.at(-1);
    return isTop
      ? ['signature']
      : newScope.slice(0, -1).concat((Number(last) - 1).toString());
  }

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
      if (node.type === 'switch') {
        return node.cases.at(0).body.at(-1).path.split('.');
      }
      if (node.type === 'case') {
        const newScope = scope.slice(0, -4);
        return newScope.length === 0 ? ['signature'] : newScope;
      }
      return newScope;
  }
});

export const down = movement((scope: Scope, ast: Ast): Scope => {
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
    case 'case':
      return [...scope, 'body', '0'];

    default:
      if (!isLast(scope, ast)) return incrementScope(scope);

      return tryIncrementScope(scope, ast);
  }
});

export const left = movement(
  (scope: Scope, ast: Ast, originalScope: Scope = scope): Scope => {
    const parent = grandParent(scope, ast);
    const parentScope = parent.path.split('.');
    const current = get(scope, ast);

    if (current.type === 'case' && scopeIndex(scope) !== 0) {
      return decrementCase(scope);
    }

    switch (parent.type) {
      case 'loop':
        return scope.slice(0, -2);
      case 'branch': {
        if (isOnIfBranch(scope, ast)) {
          const leftScope = left(parentScope, ast, originalScope);
          const hitTheWall = leftScope === originalScope;

          if (hitTheWall) {
            return originalScope;
          }

          const leftNode = get(leftScope, ast);
          const newScope = down(leftScope, ast);

          return leftNode.type === 'branch' ? right(newScope, ast) : newScope;
        }

        return swapBranch(scope, ast);
      }

      case 'case': {
        const nextCaseScope = decrementCase(parentScope);
        const isLastCase =
          nextCaseScope.join('.') === originalScope.slice(0, -2).join('.');
        if (isLastCase) return left(parentScope, ast, originalScope);

        const nextCase = get(nextCaseScope, ast);
        const currentIndex = scopeIndex(current.path.split('.'));
        const maxIndex = nextCase.body.length - 1;

        return nextCaseScope.concat([
          'body',
          Math.min(currentIndex, maxIndex).toString(),
        ]);
      }

      default:
        return originalScope;
    }
  },
);

export const right = movement(
  (scope: Scope, ast: Ast, originalScope = scope): Scope => {
    const parent = grandParent(scope, ast);
    const parentScope = parent.path.split('.');
    const current = get(scope, ast);

    if (current.type === 'case') {
      const isLastCase =
        scopeIndex(scope) === get(scope.slice(0, -2), ast)!.cases.length - 1;
      if (!isLastCase) {
        return incrementCase(scope, ast);
      }
    }

    switch (parent.type) {
      case 'function':
        return originalScope;
      case 'branch': {
        if (!isOnIfBranch(scope, ast)) {
          const hitTheWall =
            right(parentScope, ast, originalScope) === originalScope;

          if (hitTheWall) {
            return originalScope;
          }

          return down(right(parentScope, ast, originalScope), ast);
        }

        return swapBranch(scope, ast);
      }
      case 'case': {
        const nextCaseScope = incrementCase(parentScope, ast);
        const isLastCase =
          scopeIndex(parentScope) ===
          getClosestSwitch(scope, ast)!.cases.length - 1;
        if (isLastCase) return right(parentScope, ast, originalScope);

        const nextCase = get(nextCaseScope, ast);
        const currentIndex = scopeIndex(current.path.split('.'));
        const maxIndex = nextCase.body.length - 1;

        return nextCaseScope.concat([
          'body',
          Math.min(currentIndex, maxIndex).toString(),
        ]);
      }

      default:
        return down(right(parentScope, ast), ast);
    }
  },
);

export const remove = (scope: Scope, ast: Ast, strict = false): CST => {
  if (isOnSignature(scope)) return { scope, ast };

  const node = get(scope, ast);
  if (strict) {
    const parent = grandParent(scope, ast);
    const { length } = getBody(scope, parent);

    if (parent.type === 'switch' && length === 2) return { scope, ast };

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
  const isThirdOrLaterCase = node.type === 'case' && scopeIndex(scope) > 1;

  const newBody = removeFromBody(scope, ast);
  const newAst = setBody(scope, ast, newBody);
  const newScope = isThirdOrLaterCase ? left(scope, ast) : up(scope, ast);

  return { scope: newScope, ast: newAst };
};

export const add = (scope: Scope, ast: Ast, node: Ast): CST => {
  if (isCaseOutsideSwitch(scope, node)) return { scope, ast };

  const newNode = prepare(scope, node);
  const newBody = createBody(scope, ast, newNode);
  const newAst = isCaseInsideSwitch(scope, node)
    ? addCase(scope, ast, newBody)
    : setBody(scope, ast, newBody);
  const newScope = getScopeAfterAdd(scope, newAst, node);

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
