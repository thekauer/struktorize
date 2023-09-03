import { FunctionAst } from '../lib/ast';

export const DEFAULT_FUNCTION: FunctionAst = {
  signature: {
    text: [
      { type: 'char', value: 'm' },
      { type: 'char', value: 'a' },
      { type: 'char', value: 'i' },
      { type: 'char', value: 'n' },
      { type: 'lp' },
      { type: 'char', value: 'a' },
      { type: 'char', value: 'r' },
      { type: 'char', value: 'g' },
      { type: 'char', value: 's' },
      { type: 'in' },
      { type: 'mathbb', value: 'S' },
      { type: 'lb' },
      { type: 'rb' },
      { type: 'rp' },
    ],
    type: 'signature',
    path: 'signature',
  },
  body: [],
  type: 'function',
  path: '',
};
