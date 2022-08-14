import { ReactNode, useState } from "react";
import { MenuItem } from "../MenuItem/MenuItem";
import * as S from "./Layout.atoms";

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const menuItems = ["files", "export"];
  const [activeIndex, setActiveIndex] = useState(0);
  const open = activeIndex !== -1;
  const menuItemClick = (index: number) => () => {
    setActiveIndex(index === activeIndex ? -1 : index);
  };

  return (
    <S.Container>
      <S.Menu>
        {menuItems.map((item, index) => (
          <MenuItem
            key={item}
            src={`/${item}.png`}
            isActive={index === activeIndex}
            onClick={menuItemClick(index)}
          />
        ))}
      </S.Menu>
      {open && <S.ToggleMenu></S.ToggleMenu>}
      <S.Main>{children}</S.Main>
    </S.Container>
  );
};
