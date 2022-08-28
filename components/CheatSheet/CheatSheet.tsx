import * as S from "./CheatSheet.atoms";
import { Item, ItemProps } from "./Item/Item";

interface CheatSheetProps {
  items: ItemProps[];
  active: Record<string, boolean>;
  onClose: () => void;
}

export const CheatSheet = ({ items, active, onClose }: CheatSheetProps) => {
  return (
    <S.Container>
      <S.Title>Cheat sheet</S.Title>
      <S.Close onClick={onClose}>
        <S.Cross src="/cross.png" />
      </S.Close>
      <S.Grid>
        {items.map((item) => (
          <Item key={item.id} {...item} active={active[item.id]} />
        ))}
      </S.Grid>
    </S.Container>
  );
};
