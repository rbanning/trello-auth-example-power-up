import { BoardMembership } from "./board-membership";
import { MeetingSummaryPopup } from "./meeting-summary-popup";
import { MeetingUpdate } from "./meeting-update";
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
          if(!me.isAdmin) {
            console.warn("Only admins are allowed to use this feature", {members, me});
            return null;
          }

          const items = [
            {
              text: 'View ✅Pro Members',
              callback: MeetingSummaryPopup.show
            },
            {
              text: 'Update the ✔ Active List',
              callback: (tx) => {
                tx.closePopup();
                tx.popup({
                  type: 'confirm',
                  title: 'Update the Active List',
                  message: 'Move "due" cards to the Active List and clear out old active cards.',
                  confirmText: 'UPDATE',
                  onConfirm: (tt) => {
                    tt.closePopup();
                    MeetingUpdate.updateBoardMeetingCards(tt)
                      .then(results => {
                        if (results?.length > 0) {
                          tt.alert({
                            message: `Updated ${results.length} card${results.length === 0 ? '' : 's'}`,
                            display: 'success'
                          });
                        } else {
                          tt.alert({
                            message: 'No cards needed updating!',
                            display: 'info'
                          });
                        }
                      })
                      .catch(reason => {
                        console.warn("Unable to update cards", reason);
                        tt.alert({
                          message: "There was a problem trying to update the cards",
                          display: 'warning'
                        });
                      });
                  }
                });
              }
            }
          ];
          //If settings is valid, then we can include 'Configure Pro Board...'
          if (settings.pending_list_id && settings.active_list_id && settings.done_list_id) {
            items.push(
              {
                text: 'Configure Pro Board on Server',
                callback: (t) => {
                  t.closePopup();
                  t.modal({
                    title: 'Pro Board Configuration',
                    fullscreen: false,
                    url: './pro-board-setup.html',
                    height: 500
                  });
                }
              }  
            );
          }
          //Are there any 'normal' members on the board?
          var affected = members.filter(m => m.membership?.memberType === 'normal');
          if (settings.monitor_members === 'true' && affected.length > 0) {
            items.push(
              {
                text: "Reset 'normal' Members",
                callback: (t) => {
                  t.closePopup();
                  t.popup({
                    type: "confirm",
                    title: 'Reset Board Membership',
                    message: `Change ${affected.length} member${affected.length === 0 ? '' : 's'} to 'observer'`,
                    confirmText: 'Proceed',
                    onConfirm: (tx) => { 
                      tx.closePopup(); 
                      BoardMembership.resetMembership(tx, 'normal', 'observer');
                    }
                  });    
                }
              }
            );
          }

          t.popup({
            title: 'Pro Board',
            items
          });
      })      
  }


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
              text: 'Pro Board',
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