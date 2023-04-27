import { ItemProps, Kbd, Latex } from "../components/CheatSheet/Item/Item";

export const ITEMS: ItemProps[] = [
  {
    id: "statement",
    image: "/statement.png",
    name: "Statement",
    shortcut: ["Enter"],
    pressed: (e) => e.key === "Enter",
    type: "Kbd",
  },
  {
    id: "codecompletion",
    image: "/codecompletion.svg",
    shortcut: ["Ctrl", "Space"],
    pressed: (e) => e.key === " " && e.ctrlKey,
    name: "Strctorisense",
    type: "Kbd",
  },

  {
    id: "save",
    image: "/save.png",
    shortcut: ["Ctrl", "s"],
    pressed: (e) => e.key === "s" && e.ctrlKey,
    name: "Save",
    type: "Kbd",
  },
  {
    id: "toggleMenu",
    image: "/sidebar.png",
    shortcut: ["Ctrl", "b"],
    pressed: (e) => e.key === "b" && e.ctrlKey,
    name: "ToggleMenu",
    type: "Kbd",
  },
  {
    id: "searchBar",
    image: "/searchbar.png",
    shortcut: ["Ctrl", "p"],
    pressed: (e) => e.key === "p" && e.ctrlKey,
    name: "SearchBar",
    type: "Kbd",
  },
  {
    id: "deleteBlock",
    image: "/cross_box.png",
    shortcut: ["Ctrl", "⌫"],
    pressed: (e) => e.key === "Backspace" && e.ctrlKey,
    name: "DeleteBlock",
    type: "Kbd",
  },
  {
    id: "undo",
    image: "/undo.png",
    shortcut: ["Ctrl", "z"],
    pressed: (e) => e.key === "z" && e.ctrlKey,
    name: "Undo",
    type: "Kbd",
  },
  {
    id: "redo",
    image: "/redo.png",
    shortcut: ["Ctrl", "Shift", "z"],
    pressed: (e) => e.key === "Z" && e.ctrlKey && e.shiftKey,
    name: "Redo",
    type: "Kbd",
  },
  {
    id: "select",
    image: "/select.png",
    shortcut: ["Shift", "← ↑ → ↓"],
    pressed: (e) =>
      e.shiftKey &&
      (e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"),
    name: "Select",
    type: "Kbd",
  },
  {
    id: "exitScript",
    image: "/aa.png",
    shortcut: ["→"],
    pressed: (e) => e.key === "ArrowRight",
    name: "exitScript",
    type: "Kbd",
  },
  {
    id: "cheatSheet",
    image: "/help.png",
    shortcut: ["Ctrl", "i"],
    pressed: (e) => e.key === "i" && e.ctrlKey,
    name: "CheatSheet",
    type: "Kbd",
  },
  {
    id: "neq",
    image: "\\neq",
    shortcut: "!=",
    name: "Neq",
    type: "Latex",
  },
  {
    id: "land",
    image: "\\land",
    shortcut: "&&",
    name: "land",
    type: "Latex",
  },
  {
    id: "lor",
    image: "\\lor",
    shortcut: "||",
    name: "lor",
    type: "Latex",
  },
  {
    id: "ge",
    image: "\\ge",
    shortcut: ">=",
    name: "ge",
    type: "Latex",
  },
  {
    id: "le",
    image: "\\le",
    shortcut: "<=",
    name: "le",
    type: "Latex",
  },
  {
    id: "subscript",
    image: "\\mathbb{N}_{i,j}",
    shortcut: "_",
    name: "subscript",
    type: "Latex",
  },
  {
    id: "superscript",
    image: "\\mathbb{N}^{i,j}",
    shortcut: "^",
    name: "superscript",
    type: "Latex",
  },
];

export const LATEX_ITEMS = ITEMS.filter(
  (item) => item.type === "Latex"
) as Latex[];
export const KBD_ITEMS = ITEMS.filter((item) => item.type === "Kbd") as Kbd[];
