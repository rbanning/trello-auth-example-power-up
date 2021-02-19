import {env} from './_common';

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
  }
});


function meetingSummary(t: any) {
  return t.popup({
    title: 'Meeting Summary',
    url: './meeting-summary.html',
    height: 300
  });
}

function exploreMembers(t: any) {
  t.member('all')
    .then((member: any) => {
      console.log("DEBUG: exploreMember - Me", {member, canWriteToModel: t.memberCanWriteToModel('card')});
    })  
}
