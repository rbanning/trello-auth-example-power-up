import { CardBackSection } from './card-back-section';
import { CardDetailBadges } from './card-detail-badges';
import { PowerUpSettings } from './power-up-settings';


(window as any).TrelloPowerUp.initialize({
  'card-detail-badges': CardDetailBadges.build,
  'card-back-section': CardBackSection.build,
  'show-settings': PowerUpSettings.build
});

