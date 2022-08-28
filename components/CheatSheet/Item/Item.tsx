import { Fragment } from "react";
import * as S from "./Item.atoms";

export type ItemProps =
  | {
      id: string;
      image: string;
      name: string;
      type: "Kbd";
      shortcut: string[];
      active?: boolean;
    }
  | {
      id: string;
      image: string;
      name: string;
      type: "Mark";
      shortcut: string;
      active?: boolean;
    };
export const Item = ({ image, name, shortcut, type, active }: ItemProps) => {
  const Shortcut =
    type === "Mark" ? (
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
      <S.Image src={image} />
      <S.Name>{name}</S.Name>
      <S.Shortcut>{Shortcut}</S.Shortcut>
    </S.Container>
  );
};
