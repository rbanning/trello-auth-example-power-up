import { CardBackSection } from './card-back-section';
import { PowerUpSettings } from './power-up-settings';


(window as any).TrelloPowerUp.initialize({
  'card-back-section': CardBackSection.build,
  'show-settings': PowerUpSettings.build
});

