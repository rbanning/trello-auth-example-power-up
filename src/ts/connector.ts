import { DynamicIdentity } from './dynamic-identity';
import { MeetingAttendance } from './meeting-attendance';
import { MeetingSummaryPopup } from './meeting-summary-popup';
import { SettingsService } from './settings.service';
import { toastr } from './toastr.service';
import {getBoardMembers, currentUserMembership, currentUserIsAdmin, trello, env} from './_common';


(window as any).TrelloPowerUp.initialize({
  'board-buttons': (t: any) => {
    const settingsService = new SettingsService();

    return trello.Promise.all([
        settingsService.get(t),
        getBoardMembers(t)      
      ]) 
      .then(([settings, members]) => {
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
                  console.log("DEBUG: implement Reset 'normal' Members")
                }
              }
            );
          }

          return result;
        }
      })
  },
  'card-detail-badges': (t: any) => {
    return MeetingAttendance.cardDetailBadges(t);
  },
  'show-settings': meetingSettings
});


function meetingSettings(t: any) {
  return currentUserIsAdmin(t)
    .then((isAdmin: boolean) => {
      if (isAdmin) {
        return t.modal({
          title: 'Settings',
          url: './settings.html',
          fullscreen: false,
          accentColor: 'yellow',
          height: 300
        });  
      } else {
        toastr.warning(t, 'Sorry - only Admins can change the settings');
        return null;
      }    
    });
}

function exploreMembers(t: any) {
  t.member('all')
    .then((member: any) => {

      const settingService = new SettingsService();
      settingService.scope(t)
        .then((scope: DynamicIdentity.IDynamicIdentityScope) => {
          const headers = {};
          DynamicIdentity.getHeaders(scope, "member@name.com").forEach((value, key) => {
            headers[key] = value;
          });
        });
    
    });
    
  t.board('id', 'name', 'members', 'memberships')
    .then((board: any) => {
    });

  t.card('id', 'name', 'members', 'due', 'dueComplete')
    .then((card: any) => {
    });

  trello.Promise.all([
    currentUserMembership(t),
    currentUserIsAdmin(t),
  ]).then((result: any) => {
      const [member, isAdmin] = result;
    });

}
