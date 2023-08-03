import {
  ITEMS,
  KBD_ITEMS,
  LATEX_ITEMS,
} from '@/constants/defaultCheatSheetItems';
import { useTranslation } from '@/i18n/client';
import { useEffect, useMemo, useState } from 'react';

export const useActiveItems = () => {
  const [active, setActive] = useState<Record<string, boolean>>(
    ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: false }), {}),
  );
  const [buffer, setBuffer] = useState('');
  const { t } = useTranslation(['common'], { keyPrefix: 'cheatSheet' });

  const translatedItems = useMemo(() => {
    return ITEMS.map((item) => ({
      ...item,
      name: t(item.id),
    }));
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setActive((prev) => ({ ...prev, statement: true }));
      }

      const wasHatPressed = e.key === 'Dead' && e.code === 'Digit3';
      if (wasHatPressed) {
        setActive((prev) => ({ ...prev, ['superscript']: true }));
      }

      KBD_ITEMS.forEach((item) => {
        if (item.pressed(e))
          setActive((prev) => ({ ...prev, [item.id]: true }));
      });

      const allowedChars =
        /^[a-zA-Z0-9_:\+\/\(\)\*\- \"\^=\.\&\|<>!\^\×\,\[\]\;]{1}$/;
      if (allowedChars.test(e.key)) {
        setBuffer((prev) => prev + e.key);
      }

      LATEX_ITEMS.forEach((item) => {
        if ((buffer + e.key).endsWith(item.shortcut as string)) {
          setActive((prev) => ({ ...prev, [item.id]: true }));
        }
      });
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [buffer]);

  return { ITEMS: translatedItems, active };
};
