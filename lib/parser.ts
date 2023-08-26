import { AbstractChar, AbstractText, Ast, MathBB, traverse } from './ast';

type TypeId = string | null;
type Identifier = { type: 'variable'; name: string };
type Arg = { type: 'arg'; name: string; typeId: TypeId };
type Signature = {
  type: 'signature';
  name: string;
  args: Arg[];
  returnTypeId: TypeId;
};

interface Peekable<T, TNext, TReturn> extends Generator<T, TNext, TReturn> {
  peek: () => IteratorResult<TNext>;
}

function* iterator(input: AbstractText): any {
  for (const char of input) {
    yield char;
  }
}

function peekable<T, TNext, TReturn>(
  iterator: Generator<T, TNext, TReturn>,
): Peekable<T, TNext, TReturn> {
  let state = iterator.next();

  const _i: any = (function* (initial) {
    while (!state.done) {
      const current = state.value;
      state = iterator.next();
      // @ts-ignore
      const arg = yield current;
    }
    return state.value;
  })();

  _i.peek = () => state;
  return _i;
}

type AbstractIter = Peekable<AbstractChar, AbstractChar, AbstractChar>;

function abstractIter(input: AbstractText): AbstractIter {
  return peekable<AbstractChar, AbstractChar, AbstractChar>(iterator(input));
}

function isAlpha(char?: AbstractChar) {
  return char?.type === 'char' && /[a-zA-Z]/.test(char?.value);
}

function consume<T extends AbstractChar = AbstractChar>(
  input: AbstractIter,
  type: AbstractChar['type'],
) {
  whiteSpace(input);
  if (input.peek().value?.type !== type) return null;
  return input.next() as IteratorResult<T, T>;
}

function consumeOneOf(input: AbstractIter, ...types: AbstractChar['type'][]) {
  if (types.includes(input.peek().value?.type)) return input.next();
}

function consumeMany(input: AbstractIter, ...types: AbstractChar['type'][]) {
  for (const type of types) {
    if (!consume(input, type)) return false;
  }
  return true;
}

function consmeAll(input: AbstractIter, type: AbstractChar['type']) {
  while (input.peek().value?.type === type) input.next();
}

function whiteSpace(input: AbstractIter) {
  consmeAll(input, 'space');
}

function parseId(input: AbstractIter): Identifier | null {
  whiteSpace(input);

  let current: AbstractChar = input.peek().value;
  if (!isAlpha(current)) return null;

  let variable = '';
  while (current?.type === 'char') {
    variable += current.value;
    input.next();
    current = input.peek().value;
  }

  if (variable === '') return null;
  return { type: 'variable', name: variable };
}

function parseTypeId(input: AbstractIter): TypeId {
  const isTyped = consumeOneOf(input, 'colon', 'in');
  if (!isTyped) return null;

  const mathbb = consume<MathBB>(input, 'mathbb');
  if (mathbb) {
    const typeId = mathbb.value;
    if (consumeMany(input, 'lb', 'rb')) return typeId.value + '[]';
    return typeId.value;
  }
  const type = parseId(input);
  if (!type) return null;
  if (consumeMany(input, 'lb', 'rb')) return type.name + '[]';
  return type.name;
}

function parseArg(input: AbstractIter): Arg | null {
  whiteSpace(input);
  const name = parseId(input)?.name;
  if (!name) return null;
  const typeId = parseTypeId(input);
  return { type: 'arg', name, typeId };
}

function parseArgs(input: AbstractIter): Arg[] {
  whiteSpace(input);
  const args = [];
  const current = input.peek();
  while (!current.done || consume(input, 'rp')) {
    const arg = parseArg(input);
    consumeOneOf(input, 'comma', 'semicolon');

    if (arg) args.push(arg);
    else break;
  }
  return args;
}

function parseSignature(input: AbstractIter): Signature | null {
  whiteSpace(input);
  const name = parseId(input)?.name;

  if (!name) return null;
  if (!consume(input, 'lp')) return null;

  const args = parseArgs(input);
  if (!args) return null;

  if (!consume(input, 'rp')) return null;

  const returnTypeId = parseTypeId(input);
  return { type: 'signature', name, args, returnTypeId };
}

export function parseSignatureText(input: AbstractText) {
  const iter = abstractIter(input);
  return parseSignature(iter);
}

export function parseIdsText(input: AbstractText) {
  const iter = abstractIter(input);
  const variables = [];
  while (!iter.peek().done) {
    const variable = parseId(iter);
    if (!variable) {
      let next = iter.next();
      while (!iter.peek().done && !isAlpha(next.value)) next = iter.next();
    } else variables.push(variable);
  }
  return variables;
}

export function parseAll(ast: Ast) {
  return traverse(ast, (node) => {
    if ('text' in node) {
      const iter = abstractIter(node.text);
      if (node.type === 'signature') return parseSignature(iter) ?? [];
      return parseIdsText(node.text);
    }
    return [];
  });
}
