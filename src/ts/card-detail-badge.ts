import { AboutPage } from "./about-page";
import { SettingsService } from "./settings.service";
import { trello } from "./_common";

export namespace CardDetailBadge {

  export const build = (t: any) => {
    const settingsService = new SettingsService();

    return trello.Promise.all([
        settingsService.get(t),
        t.card('id')      
      ]) 
      .then(([settings, card]) => {

        //VALIDATION
        if (!settings) {
          console.warn("Unable to retrieve settings", {settings});
          return [];
        }
        if (!card) {
          console.warn("Unable to retrieve card", {card});
          return [];
        }

        const result = [
          {
            title: 'About',
            text: 'Card Details',
            color: 'orange',
            callback: AboutPage.showAboutCard 
          }
        ];

        return result;
    });
  };


}
