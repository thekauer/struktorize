import { useAstState } from '@/hooks/useAST';
import { InsertMode } from '@/lib/abstractText';

const colorMap: Record<InsertMode, { fg: string; bg: string }> = {
  normal: { bg: 'var(--blue)', fg: 'var(--text)' },
  inside: { bg: 'var(--purple)', fg: 'var(--text)' },
};

const textMap = { normal: 'NORMAL', inside: 'INDEX', edit: 'EDIT' };

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
      }}
    >
      {textMap[insertMode]}
    </span>
  );
};
