'use client';

import { useTranslation } from '@/i18n/client';
import { useEffect, useState } from 'react';
import { useActiveItems } from '../../hooks/useActiveItems';
import * as S from './CheatSheet.atoms';
import { Item } from './Item/Item';

export const CheatSheet = () => {
  const { ITEMS: items, active } = useActiveItems();
  const { t } = useTranslation(['common'], { keyPrefix: 'cheatSheet' });
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  useEffect(() => {
    const infoToggle = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'i') {
        setShowCheatSheet((prev) => !prev);
      }
    };

    document.addEventListener('keydown', infoToggle);

    return () => {
      document.removeEventListener('keydown', infoToggle);
    };
  }, []);

  if (!showCheatSheet) return null;

  return (
    <S.Container>
      <S.Title>{t('title')}</S.Title>
      <S.Close onClick={() => setShowCheatSheet(false)}>
        <S.Cross $src="/cross.png" />
      </S.Close>
      <S.Grid>
        {items.map((item) => (
          <Item key={item.id} {...item} active={active[item.id]} />
        ))}
      </S.Grid>
    </S.Container>
  );
};
