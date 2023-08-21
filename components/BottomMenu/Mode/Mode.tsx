import { useAstState } from '@/hooks/useAST';
import { InsertMode } from '@/lib/abstractText';

const colorMap: Record<InsertMode, { fg: string; bg: string }> = {
  normal: { bg: 'var(--blue)', fg: 'var(--text)' },
  superscript: { bg: 'var(--text)', fg: 'var(--blue)' },
  subscript: { bg: 'var(--text)', fg: 'var(--blue)' },
};

const textMap: Record<InsertMode, string> = {
  normal: 'NORMAL',
  superscript: 'INDEX',
  subscript: 'INDEX',
};

export const Mode = () => {
  const { insertMode } = useAstState();

  const color = colorMap[insertMode];
  return (
    <span
      style={{
        color: color.fg,
        background: color.bg,
        width: '6ch',
        textAlign: 'center',
        padding: '0.125rem',
      }}
    >
      {textMap[insertMode]}
    </span>
  );
};
