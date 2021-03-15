export interface ITrelloEnvironment {
  Promise: any;
  t: () => any;
}
export const trello: ITrelloEnvironment = {
  Promise: (window as any).TrelloPowerUp.Promise,
  t:  () => (window as any).TrelloPowerUp.iframe()
};

export const env = {
  name: '%%NAME%%',
  scope: '%%SCOPE%%',
  scope_code: '%%SCOPE_CODE%%',
  scope_secret: '%%SCOPE_SECRET%%',
  base_url: '%%BASE_URL%%',
  platform: '%%PLATFORM%%',
  version: '%%VERSION%%',

  SETTINGS_KEY: '%%KEY%%',

  accentColor: '#fcba03',

  logo: {
    color: '%%APP_URL%%/icon-color.png',
    gray: '%%APP_URL%%/icon-gray.png',
    white: '%%APP_URL%%/icon-white.png',
    black: '%%APP_URL%%/icon-black.png'
  }
};

export const currentUserMembership = (t: any) => {
  return trello.Promise.all([
    t.member('all'),
    t.board('name', 'memberships')
  ]).then((results: any[]) => {
    const [member, board] = results;

    if (member && board) {
      const membership = board.memberships?.find(m => m.idMember === member.id);
      return {
        ...member,
        memberType: membership?.memberType
      };
    }

    //else
    return member;
  });
};

export const currentUserIsAdmin = (t: any) => {
  return currentUserMembership(t)
    .then((member: any) => {
      return member?.memberType === 'admin';
    });
};

export const getBoardMembers = (t: any) => {
  return trello.Promise.all([
    t.member('all'),
    t.board('name', 'members', 'memberships')
  ]).then((results: any[]) => {
    const [member, board] = results;

    if (member && board) {
      return board.members.map(m => {
        const result = {
          ...m,
          membership: board.memberships?.find(s => s.idMember === m.id),
          isMe: m.id === member.id
        };
        result.isAdmin = result.membership?.memberType === 'admin';
        return result;
      });
    }

    //else
    return null;
  });
};

export const isMemberOf = (id: string, members: any | any[]): boolean => {
  if (Array.isArray(members.members)) { members = members.members; }
  if (!id || !Array.isArray(members)) { return null; }

  return members.some(m => m.id === id);
};

