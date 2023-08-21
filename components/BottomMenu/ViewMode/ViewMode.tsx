import * as S from './ViewMode.atoms';
import { useTheme } from '../../../hooks/useTheme';

export const ViewMode = () => {
  const { showScope, setShowScope } = useTheme();

  const billSrc = `/bill-${showScope ? 'line' : 'fill'}.png`;
  const articleSrc = `/article-${showScope ? 'fill' : 'line'}.png`;

  return (
    <S.Container>
      <S.ImageContainer>
        <S.Image $src={articleSrc} onClick={() => setShowScope(true)} />
      </S.ImageContainer>
      <S.ImageContainer>
        <S.Image $src={billSrc} onClick={() => setShowScope(false)} />
      </S.ImageContainer>
    </S.Container>
  );
};
