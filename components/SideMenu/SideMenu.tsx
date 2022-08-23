import { useState } from "react";
import { Export } from "./Export/Export";
import { Files } from "./Files/Files";
import { MenuItem } from "./MenuItem/MenuItem";
import * as S from "./SideMenu.atoms";

export const SideMenu = () => {
  const menus = [() => <Files />, () => <Export />];
  const menuItems = ["files", "export"];
  const [activeIndex, setActiveIndex] = useState(0);
  const open = activeIndex !== -1;
  const menuItemClick = (index: number) => () => {
    setActiveIndex(index === activeIndex ? -1 : index);
  };

  const ActiveMenu = menus[activeIndex];

  return (
    <>
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
    </>
  );
};
