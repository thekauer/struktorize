import { useAST } from "../../hooks/useAST";
import { Ast } from "../../lib/ast";
import { Function, FunctionAst } from "../Function/Function";
import { Signature, SignatureAst } from "../Signature/Signature";
import { Statement, StatementAst } from "../Statement/Statement";

interface RenderProps {
  head?: Ast;
}

export const Render = ({ head }: RenderProps) => {
  const { isSelected } = useAST();

  if (!head) return null;
  const props = { selected: isSelected(head.path) };
  switch (head.type) {
    case "function": {
      const fn = head as FunctionAst;
      return (
        <Function
          signature={<Render head={fn.signature} />}
          body={fn.body.map((node, index) => (
            <Render key={(node.path as any) + index} head={node} />
          ))}
          {...props}
        />
      );
    }
    case "signature": {
      const sig = head as SignatureAst;
      return <Signature text={sig.text} {...props} />;
    }
    case "statement": {
      const stmt = head as StatementAst;
      return <Statement text={stmt.text} {...props} />;
    }

    default:
      return null;
  }
};
