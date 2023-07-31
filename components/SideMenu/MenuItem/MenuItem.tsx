'use client';

import * as S from './MenuItem.atoms';

interface MenuItemProps {
  src: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const MenuItem = ({ src, isActive, onClick }: MenuItemProps) => {
  return (
    <S.Container>
      <S.Left $isOpen={isActive} />
      <S.MenuItem $src={src} $active={isActive} onClick={onClick} />
      <S.Right />
    </S.Container>
  );
};
