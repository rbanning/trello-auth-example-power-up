import { env } from './_common';
console.log("connector", { env });
window.TrelloPowerUp.initialize({
    'board-buttons': (t) => {
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
    return t.popup({
        title: 'Settings',
        url: './settings.html',
        height: 300
    });
}
function exploreMembers(t) {
    t.member('all')
        .then((member) => {
        console.log("DEBUG: exploreMember - Me", { member, canWriteToModel: t.memberCanWriteToModel('card') });
    });
    t.board('id', 'name', 'members', 'memberships')
        .then((board) => {
        console.log("DEBUG: exploreMember - Board", { board });
    });
    t.card('id', 'name', 'members', 'due', 'dueComplete')
        .then((card) => {
        console.log("DEBUG: exploreMember - Card", { card });
    });
}
//# sourceMappingURL=connector.js.map