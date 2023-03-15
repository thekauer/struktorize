import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { Export } from "./Export/Export";
import { Files } from "./Files/Files";
import { MenuItem } from "./MenuItem/MenuItem";
import { Profile } from "./Profile/Profile";
import * as S from "./SideMenu.atoms";

export const SideMenu = () => {
  const [activeMenu, setActiveMenu] = useState<string | undefined>("files");
  const [showMenu, setShowMenu] = useState<boolean>(true);
  const { theme, setTheme, setAstTheme } = useTheme();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "b" && e.ctrlKey) {
        setShowMenu((sm) => !sm);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const moonSrc = theme === "dark" ? "./moon.png" : "./moon_filled.png";
  const moonClick = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    setAstTheme(theme === "dark" ? "light" : "dark");
  };

  const menus: Record<string, JSX.Element> = useMemo(
    () => ({
      files: <Files />,
      export: <Export />,
      profile: <Profile />,
    }),
    []
  );

  const topMenuItems = ["files", "export"];
  const menuItemClick = (name: string) => () => {
    setShowMenu((sm) => (activeMenu === name ? !sm : true));
    setActiveMenu(name);
  };

  const ActiveMenu: any = useMemo(
    () => (activeMenu ? () => menus[activeMenu] : null),
    [activeMenu]
  );

  return (
    <>
      <S.Menu tabIndex={0}>
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
      {showMenu && (
        <S.ToggleMenu tabIndex={0}>
          <ActiveMenu />
        </S.ToggleMenu>
      )}
    </>
  );
};
