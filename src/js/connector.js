import { DynamicIdentity } from './dynamic-identity';
import { SettingsService } from './settings.service';
import { toastr } from './toastr.service';
import { currentUserMembership, currentUserIsAdmin, trello } from './_common';
window.TrelloPowerUp.initialize({
    'board-buttons': (t) => {
        const settingService = new SettingsService();
        settingService.get(t)
            .then(settings => {
            console.log("DEBUG:// SETTINGS", settings);
        });
        return [
            {
                text: 'Meeting Summary',
                condition: 'edit',
                callback: meetingSummary
            }
        ];
    },
    'card-detail-badges': (t) => {
        //todo: restrict access to admins... how?
        return [
            {
                text: 'Explore Members/Membership',
                callback: exploreMembers
            }
        ];
    },
    'show-settings': meetingSettings
});
function meetingSummary(t) {
    return t.popup({
        title: 'Meeting Summary',
        url: './meeting-summary.html',
        height: 300
    });
}
function meetingSettings(t) {
    return currentUserIsAdmin(t)
        .then((isAdmin) => {
        if (isAdmin) {
            return t.popup({
                title: 'Settings',
                url: './settings.html',
                height: 300
            });
        }
        else {
            toastr.warning(t, 'Sorry - only Admins can change the settings');
            return null;
        }
    });
}
function exploreMembers(t) {
    t.member('all')
        .then((member) => {
        console.log("DEBUG: exploreMember - Me", { member, canWriteToModel: t.memberCanWriteToModel('card') });
        const settingService = new SettingsService();
        settingService.scope(t)
            .then((scope) => {
            const headers = {};
            DynamicIdentity.getHeaders(scope, "member@name.com").forEach((value, key) => {
                headers[key] = value;
            });
            console.log("DEBUG: DynamicIdentity.getHeaders", { scope, headers });
        });
    });
    t.board('id', 'name', 'members', 'memberships')
        .then((board) => {
        console.log("DEBUG: exploreMember - Board", { board });
    });
    t.card('id', 'name', 'members', 'due', 'dueComplete')
        .then((card) => {
        console.log("DEBUG: exploreMember - Card", { card });
    });
    trello.Promise.all([
        currentUserMembership(t),
        currentUserIsAdmin(t),
    ]).then((result) => {
        const [member, isAdmin] = result;
        console.log("DEBUG: exploreMember - currentUserMembership", { result, member, isAdmin });
    });
}
//# sourceMappingURL=connector.js.map