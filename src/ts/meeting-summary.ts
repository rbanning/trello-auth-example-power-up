import { DateHelper } from "./date-helper";
import { LoadingService } from "./loading.service";
import { trello } from "./_common";

const t = trello.t();
const loading = new LoadingService();
loading.show();


t.render(() => {



  //HELPERS
  const close = () => {
    trello.t().closePopup();
  };

  const memberHtml = (member: any) => {
    return `<div class="member" title="${member.username}"><img src="${member.avatar}" alt="avatar"/> <span>${member.fullName}</span></div>`;
  };

  //SETUP CLOSE BUTTON
  window.document.querySelectorAll('.close')
    .forEach(btn => {
      btn.addEventListener('click', close);
    });

  
  //GET ALL OF THE INFORMATION
  t.board('id','members','memberships')
    .then((board) => {
      //get the card
      const card = t.arg('card');
      const missing = board.members.filter(bm => !card.members.some(cm => bm.id === cm.id));

      console.log("Meeting Summary", "todo: need to implement the meeting summary", {card, board, missing});      

      //subtitle
      const subtitle = window.document.getElementById('subtitle');
      subtitle.innerHTML = `<span class="date">${DateHelper.dateMedium(new Date(card.due))}</span> <span class="title">${card.name}</span>`;

      //content
      const content = window.document.getElementById('content');

      //missing
      const secMissing = window.document.createElement('section');
      secMissing.innerHTML = '<h3>Missing</h3>'
        + (missing.length === 0 ? '<p><strong>None</strong></p>' : `<ul><li>${missing.map(memberHtml).join('</li><li>')}</li></ul>`);

      //attended
      const secAttended = window.document.createElement('section');
      secAttended.innerHTML = '<h3>Attended</h3>'
        + (card.members.length === 0 ? '<p><strong>None</strong></p>' : `<ul><li>${card.members.map(memberHtml).join('</li><li>')}</li></ul>`);
      
      content.append(secMissing);
      content.append(secAttended);     
    })
    .then(() => {
      loading.hide();
      return t.sizeTo('#page');
    });
});