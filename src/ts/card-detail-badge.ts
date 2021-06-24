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
      onConfirm: (tt) => { console.log("LOVE"); tt.closePopup(); },
      cancelText: 'NOT',
      onCancel: (tt) => { console.log("NOT"); tt.closePopup(); }
    });
  };

  const whatsYourName = (t) => {
    t.member('id', 'fullName', 'username')
      .then((member) => {
        console.log("DEBUG: member information", {member});
        const tt = trello.t();
        tt.popup({
          type: 'confirm',
          title: 'What is your name?',
          message: `Is your name: ${member.fullName}?`,
          confirmText: 'Yes, it is',
          confirmStyle: 'primary',
          onConfirm: (tt) => { console.log("YES"); tt.closePopup(); },
          cancelText: 'No, it is not',
          onCancel: (tt) => { console.log("NO"); tt.closePopup(); }
        });
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
            title: 'Test',
            text: 'Popup Test 1',
            color: 'lime',
            callback: doYouLoveMe
          },
          {
            title: 'Test',
            text: 'Popup Test 2',
            color: 'lime',
            callback: whatsYourName
          }
        ];

        return result;
    });
  };


}
