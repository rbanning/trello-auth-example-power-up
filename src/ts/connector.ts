import { BoardButtons } from './board-buttons';
import { DynamicIdentity } from './dynamic-identity';
import { MeetingAttendance } from './meeting-attendance';
import { SettingsService } from './settings.service';
import { toastr } from './toastr.service';
import { currentUserMembership, currentUserIsAdmin, trello} from './_common';


(window as any).TrelloPowerUp.initialize({
  'board-buttons': (t: any) => {
    return BoardButtons.build(t);
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
