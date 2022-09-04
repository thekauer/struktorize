import { useEffect, useState } from "react";
import { ItemProps } from "../components/CheatSheet/Item/Item";

const ITEMS: ItemProps[] = [
  {
    id: "statement",
    image: "/statement.png",
    name: "Statement",
    shortcut: ["Enter"],
    type: "Kbd",
  },
  {
    id: "branch",
    image: "/branch.png",
    name: "Branch",
    shortcut: "if",
    type: "Mark",
  },
  {
    id: "loop",
    image: "/loop.png",
    name: "Loop",
    shortcut: "loop",
    type: "Mark",
  },
];

const MARK_ITEMS = ITEMS.filter((item) => item.type === "Mark");

export const useActiveItems = () => {
  const [active, setActive] = useState<Record<string, boolean>>(
    ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );
  const [buffer, setBuffer] = useState("");

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        setActive((prev) => ({ ...prev, statement: true }));
      }

      setBuffer((prev) => prev + e.key);

      MARK_ITEMS.forEach((item) => {
        if ((buffer + e.key).endsWith(item.shortcut as string)) {
          setActive((prev) => ({ ...prev, [item.id]: true }));
        }
      });
    };

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [buffer]);

  return { ITEMS, MARK_ITEMS, active };
};
