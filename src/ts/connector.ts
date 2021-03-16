import { BoardButtons } from './board-buttons';
import { CardBackSection } from './card-back-section';
import { CardBadge } from './card-badge';
import { CardDetailBadge } from './card-detail-badge';
import { ListActions } from './list-actions';
import { PowerUpSettings } from './power-up-settings';


(window as any).TrelloPowerUp.initialize({
  'board-buttons': BoardButtons.build,
  'card-badges': CardBadge.build,
  'card-detail-badges': CardDetailBadge.build,
  'card-back-section': CardBackSection.build,
  'list-actions': ListActions.build,
  'show-settings': PowerUpSettings.build
});

