import * as S from './BottomMenu.atoms';
import { Mode } from './Mode/Mode';
import { LanguageSelector } from './LanguageSelector/LanguageSelector';
import { ViewMode } from './ViewMode/ViewMode';
import { UndoRedo } from './UndoRedo/UndoRedo';

export const BottomMenu = () => {
  return (
    <S.Container>
      <S.Left>
        <LanguageSelector />
        <UndoRedo />
        <Mode />
      </S.Left>
      <S.Right>
        <ViewMode />
      </S.Right>
    </S.Container>
  );
};
