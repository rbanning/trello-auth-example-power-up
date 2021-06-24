import { AboutPage } from "./about-page";
import { SettingsService } from "./settings.service";
import { trello } from "./_common";

export namespace CardDetailBadge {

  const doYouLoveMe = (t) => {
    t.popup({
      type: 'confirm',
      title: 'Do You Love Me?',
      message: 'So, what do you think?',
      confirmText: 'Love You',
      confirmStyle: 'primary',
      onConfirm: (tt) => { tt.closePopup(); },
      cancelText: 'NOT',
      onCancel: (tt) => { console.log("NOT"); }
    });
  };

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
            color: 'sky',
            callback: AboutPage.showAboutCard 
          },
          {
            title: 'Text',
            text: 'Popup Test',
            color: 'lime',
            callback: doYouLoveMe
          }
        ];

        return result;
    });
  };


}
