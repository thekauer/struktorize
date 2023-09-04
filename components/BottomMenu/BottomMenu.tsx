import * as S from './BottomMenu.atoms';
import { Mode } from './Mode/Mode';
import { LanguageSelector } from './LanguageSelector/LanguageSelector';
import { ViewMode } from './ViewMode/ViewMode';
import { UndoRedo } from './UndoRedo/UndoRedo';
import { Save } from './Save/Save';

export const BottomMenu = () => {
  return (
    <S.Container>
      <S.Left>
        <Save />
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
