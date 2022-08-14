import { ReactNode, useState } from "react";
import { Files } from "../Files/Files";
import { MenuItem } from "../MenuItem/MenuItem";
import * as S from "./Layout.atoms";

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const menus = [() => <Files />, () => <h1>Exports</h1>];
  const menuItems = ["files", "export"];
  const [activeIndex, setActiveIndex] = useState(0);
  const open = activeIndex !== -1;
  const menuItemClick = (index: number) => () => {
    setActiveIndex(index === activeIndex ? -1 : index);
  };

  const ActiveMenu = menus[activeIndex];

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
      {open && (
        <S.ToggleMenu>
          <ActiveMenu />
        </S.ToggleMenu>
      )}
      <S.Main>{children}</S.Main>
    </S.Container>
  );
};
