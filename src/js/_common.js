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
    SETTINGS_KEY: 'hallpass_meeting_settings',
    logo: {
        white: 'https://trg-meeting-power-up.netlify.app/meeting-white.png',
        black: 'https://trg-meeting-power-up.netlify.app/meeting-black.png'
    }
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
export const getBoardMembers = (t) => {
    return trello.Promise.all([
        t.member('all'),
        t.board('name', 'members', 'memberships')
    ]).then((results) => {
        const [member, board] = results;
        if (member && board) {
            return board.members.map(m => {
                var _a, _b;
                const result = Object.assign(Object.assign({}, m), { membership: (_a = board.memberships) === null || _a === void 0 ? void 0 : _a.find(s => s.idMember === m.id), isMe: m.id === member.id });
                result.isAdmin = ((_b = result.membership) === null || _b === void 0 ? void 0 : _b.memberType) === 'admin';
                return result;
            });
        }
        //else
        return null;
    });
};
export const isMemberOf = (id, members) => {
    if (Array.isArray(members.members)) {
        members = members.members;
    }
    if (!id || !Array.isArray(members)) {
        return null;
    }
    return members.some(m => m.id === id);
};
//# sourceMappingURL=_common.js.map