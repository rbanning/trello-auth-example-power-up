import { BoardMembership } from "./board-membership";
import { MeetingSummaryPopup } from "./meeting-summary-popup";
import { SettingsService } from "./settings.service";
import { trello, getBoardMembers, env } from "./_common";

export namespace BoardButtons {

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

          var result = [
            {
              text: 'View Attendance',
              icon: {
                dark: env.logo.white,
                light: env.logo.black
              },
              condition: 'edit',
              callback: MeetingSummaryPopup.show 
            }
          ];

          if (settings.monitor_members === 'true' && members.some(m => m.membership?.memberType === 'normal')) {
            result.push(
              {
                text: "Reset 'normal' Members",
                icon: null,
                condition: 'edit',
                callback: (t) => {
                  BoardMembership.resetMembership('normal', 'observer', t)
                    .then(result => {
                      console.log("DEBUG: board button finished", {result});
                    })
                    .catch(reason => {
                      console.warn("DEBUG: board button failed", {reason});
                    });
                }
              }
            );
          }

          return result;
        }
      })
  };
}