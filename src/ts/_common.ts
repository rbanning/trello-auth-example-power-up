export interface ITrelloEnvironment {
  Promise: any;
  t: () => any;
}
export const trello: ITrelloEnvironment = {
  Promise: (window as any).TrelloPowerUp.Promise,
  t:  () => { return (window as any).TrelloPowerUp.iframe(); }
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

export const currentUserMembership = (t: any) => {
  return trello.Promise.all([
    t.member('all'),
    t.board('name', 'memberships')
  ]).then((results: any[]) => {
    const [member, board] = results;

    if (member && board) {
      const membership = board.memberships?.find(m => m.idMember == member.id);
      return {
        ...member,
        memberType: membership?.memberType
      };
    }

    //else
    return member;
  })
}

export const currentUserIsAdmin = (t: any) => {
  return currentUserMembership(t)
    .then((member: any) => {
      return member?.memberType === 'admin';
    });
}

export const isMemberOf = (id: string, members: any | any[]): boolean => {
  if (Array.isArray(members.members)) { members = members.members; }
  if (!id || !Array.isArray(members)) { return null; }

  return members.some(m => m.id === id);
}