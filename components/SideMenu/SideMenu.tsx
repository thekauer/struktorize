import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { Export } from "./Export/Export";
import { Files } from "./Files/Files";
import { MenuItem } from "./MenuItem/MenuItem";
import { Profile } from "./Profile/Profile";
import * as S from "./SideMenu.atoms";

export const SideMenu = () => {
  const [activeMenu, setActiveMenu] = useState<string | undefined>("files");
  const { theme, setTheme, setAstTheme } = useTheme();
  const { data: session, status } = useSession();

  const moonSrc = theme === "dark" ? "./moon.png" : "./moon_filled.png";
  const moonClick = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    setAstTheme(theme === "dark" ? "light" : "dark");
  };

  const menus: Record<string, JSX.Element> = {
    files: <Files />,
    export: <Export />,
    profile: <Profile />,
  };

  const topMenuItems = ["files", "export"];
  const open = activeMenu !== undefined;
  const menuItemClick = (name: string) => () => {
    setActiveMenu((prev) => (prev === name ? undefined : name));
  };

  const ActiveMenu: any = useMemo(
    () => (activeMenu ? () => menus[activeMenu] : null),
    [activeMenu]
  );

  return (
    <>
      <S.Menu>
        <S.MenuTray>
          {topMenuItems.map((item) => (
            <MenuItem
              key={item}
              src={`/${item}.png`}
              isActive={item === activeMenu}
              onClick={menuItemClick(item)}
            />
          ))}
        </S.MenuTray>
        <S.MenuTray>
          {status === "authenticated" && session.user?.image && (
            <S.Profile
              src={session.user?.image}
              onClick={menuItemClick("profile")}
              referrerPolicy="no-referrer"
            />
          )}
          <MenuItem src={moonSrc} onClick={moonClick} />
        </S.MenuTray>
      </S.Menu>
      {open && (
        <S.ToggleMenu tabIndex={0}>
          <ActiveMenu />
        </S.ToggleMenu>
      )}
    </>
  );
};
