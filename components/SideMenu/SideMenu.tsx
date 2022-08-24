import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { Export } from "./Export/Export";
import { Files } from "./Files/Files";
import { MenuItem } from "./MenuItem/MenuItem";
import * as S from "./SideMenu.atoms";

export const SideMenu = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { theme, setTheme,setAstTheme } = useTheme();

  const moonSrc = theme === "dark" ? "./moon.png" : "./moon_filled.png";
  const moonClick = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    setAstTheme(theme === "dark" ? "light" : "dark");
  };

  const menus = [() => <Files />, () => <Export />];
  const menuItems = ["files", "export"];
  const open = activeIndex !== -1;
  const menuItemClick = (index: number) => () => {
    setActiveIndex(index === activeIndex ? -1 : index);
  };

  const ActiveMenu = menus[activeIndex];

  return (
    <>
      <S.Menu>
        <S.TopMenu>
          {menuItems.map((item, index) => (
            <MenuItem
              key={item}
              src={`/${item}.png`}
              isActive={index === activeIndex}
              onClick={menuItemClick(index)}
            />
          ))}
        </S.TopMenu>
        <S.BottomMenu>
          <MenuItem src={moonSrc} onClick={moonClick} />
        </S.BottomMenu>
      </S.Menu>
      {open && (
        <S.ToggleMenu>
          <ActiveMenu />
        </S.ToggleMenu>
      )}
    </>
  );
};
