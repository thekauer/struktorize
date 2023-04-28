import { Latex } from "@/components/Ast/Latex/Latex";
import { Fragment } from "react";
import * as S from "./Item.atoms";

interface ItemBase {
  id: string;
  image: string;
  name: string;
  active?: boolean;
}

export interface Kbd extends ItemBase {
  type: "Kbd";
  pressed: (e: KeyboardEvent) => boolean;
  shortcut: string[];
}

export interface Latex extends ItemBase {
  type: "Latex";
  shortcut: string;
}

export type ItemProps = Kbd | Latex;

export const Item = ({ image, name, shortcut, type, active }: ItemProps) => {
  const Shortcut =
    type !== "Kbd" ? (
      <S.Mark active={active}>{shortcut}</S.Mark>
    ) : (
      shortcut.map((s, index, { length }) => (
        <Fragment key={index}>
          <S.Kbd key={index} active={active}>
            {s}
          </S.Kbd>
          {index !== length - 1 && " + "}
        </Fragment>
      ))
    );

  return (
    <S.Container>
      {type === "Latex" ? (
        <S.Center active={active}>
          <Latex>{image}</Latex>
        </S.Center>
      ) : (
        <S.Image src={image} active={active} />
      )}
      <S.Name>{name}</S.Name>
      <S.Shortcut>{Shortcut}</S.Shortcut>
    </S.Container>
  );
};
