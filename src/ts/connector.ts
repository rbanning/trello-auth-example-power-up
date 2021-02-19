import {env, currentUserMembership, currentUserIsAdmin, trello} from './_common';

console.log("connector", {env});



(window as any).TrelloPowerUp.initialize({
  'board-buttons': (t: any) => {
    return [
      {
        text: 'Meeting Summary',
        condition: 'edit',
        callback: meetingSummary 
      }
    ]
  },
  'card-detail-badges': (t: any) => {
    //todo: restrict access to admins... how?
    return [
      {
        text: 'Explore Members/Membership',        
        callback: exploreMembers
      }
    ]
  },
  'show-settings': meetingSettings
});


function meetingSummary(t: any) {
  return t.popup({
    title: 'Meeting Summary',
    url: './meeting-summary.html',
    height: 300
  });
}

function meetingSettings(t: any) {
  return t.popup({
    title: 'Settings',
    url: './settings.html',
    height: 300
  });
}

function exploreMembers(t: any) {
  t.member('all')
    .then((member: any) => {
      console.log("DEBUG: exploreMember - Me", {member, canWriteToModel: t.memberCanWriteToModel('card')});
    });
    
  t.board('id', 'name', 'members', 'memberships')
    .then((board: any) => {
      console.log("DEBUG: exploreMember - Board", {board});
    });

  t.card('id', 'name', 'members', 'due', 'dueComplete')
    .then((card: any) => {
      console.log("DEBUG: exploreMember - Card", {card});
    });

  trello.Promise.all([
    currentUserMembership(t),
    currentUserIsAdmin(t),
  ]).then((result: any) => {
      const [member, isAdmin] = result;
      console.log("DEBUG: exploreMember - currentUserMembership", {result, member, isAdmin});
    })
}
