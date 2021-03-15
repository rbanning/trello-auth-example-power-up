import { AboutPage } from "./about-page";
import { ISettings, SettingsService } from "./settings.service";
import { trello, getBoardMembers, env } from "./_common";

export namespace BoardButtons {

  const showBoardAdminMenu = (t) => {
    const settingsService = new SettingsService();

    return trello.Promise.all([
        settingsService.get(t),
        getBoardMembers(t)      
      ])
      .then(([settings, members]: [ISettings, any]) => {
          //VALIDATION
          if (!settings) {
            console.warn("Unable to retrieve settings", {settings});
            return null;
          }
          if (!Array.isArray(members)) {
            console.warn("Unable to retrieve board members", {members});
            return null;
          }
          const me = members.find(m => m.isMe);
          if (!me) {
            console.warn("Unable to find me within board members", {members, me});
            return null;
          }        
          if (!me.isAdmin) {
            console.warn("Only admins are allowed to use this feature", {members, me});
            return null;
          }

          const items = [
            {
              text: 'About this Board',
              callback: AboutPage.showAboutBoard
            }
          ];

          t.popup({
            title: env.name,
            items
          });
      });      
  };


  export const build = (t: any) => {
    const settingsService = new SettingsService();

    return trello.Promise.all([
        settingsService.get(t),
        getBoardMembers(t)      
      ]) 
      .then(([settings, members]) => {

        //VALIDATION
        if (!settings) {
          console.warn("Unable to retrieve settings", {settings});
          return [];
        }
        if (!Array.isArray(members)) {
          console.warn("Unable to retrieve board members", {members});
          return [];
        }
        const me = members.find(m => m.isMe);
        if (!me) {
          console.warn("Unable to find me within board members", {members, me});
          return [];
        }


        //ONLY ADMINS GET BUTTONS
        if (me.isAdmin) {

          const result = [
            {
              text: env.name,
              icon: {
                dark: env.logo.white,
                light: env.logo.black
              },
              condition: 'edit',
              callback: showBoardAdminMenu 
            }
          ];

          return result;
        }

        //else
        return null;
      });
  };

}
