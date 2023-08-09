'use client';

import { Ast } from '../../../lib/ast';
import { Branch } from '../Branch/Branch';
import { Switch } from '../Switch/Switch';
import { Case } from '../Case/Case';
import { Function } from '../Function/Function';
import { Loop } from '../Loop/Loop';
import { Signature } from '../Signature/Signature';
import { Statement } from '../Statement/Statement';

interface RenderProps {
  head?: Ast | Ast[];
}

export const Render = ({ head }: RenderProps) => {
  const typeMap = new Map<string, any>([
    ['function', Function],
    ['signature', Signature],
    ['statement', Statement],
    ['branch', Branch],
    ['loop', Loop],
    ['switch', Switch],
    ['case', Case],
  ]);

  if (!head) return null;
  if (Array.isArray(head)) {
    return head.map((node) => {
      return <Render head={node} key={node.path} />;
    });
  }

  return typeMap.get(head.type)?.(head);
};
