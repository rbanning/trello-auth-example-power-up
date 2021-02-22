export const trello = {
    Promise: window.TrelloPowerUp.Promise,
    t: () => { return window.TrelloPowerUp.iframe(); }
};
export const env = {
    name: '%%NAME%%',
    scope: '%%SCOPE%%',
    scope_code: '%%SCOPE_CODE%%',
    scope_secret: '%%SCOPE_SECRET%%',
    base_url: '%%BASE_URL%%',
    platform: '%%PLATFORM%%',
    version: '%%VERSION%%',
    SETTINGS_KEY: 'hallpass_meeting_settings'
};
export const currentUserMembership = (t) => {
    return trello.Promise.all([
        t.member('all'),
        t.board('name', 'memberships')
    ]).then((results) => {
        var _a;
        const [member, board] = results;
        if (member && board) {
            const membership = (_a = board.memberships) === null || _a === void 0 ? void 0 : _a.find(m => m.idMember == member.id);
            return Object.assign(Object.assign({}, member), { memberType: membership === null || membership === void 0 ? void 0 : membership.memberType });
        }
        //else
        return member;
    });
};
export const currentUserIsAdmin = (t) => {
    return currentUserMembership(t)
        .then((member) => {
        return (member === null || member === void 0 ? void 0 : member.memberType) === 'admin';
    });
};
//# sourceMappingURL=_common.js.map