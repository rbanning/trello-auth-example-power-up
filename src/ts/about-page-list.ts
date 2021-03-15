import { LoadingService } from "./loading.service";
import { trello } from "./_common";

const t = trello.t();
const loading = new LoadingService();
loading.show();


t.render(() => {



  //HELPERS
  const close = () => {
    trello.t().closeModal();
  };

  //SETUP CLOSE BUTTON
  window.document.querySelectorAll('.close')
    .forEach(btn => {
      btn.addEventListener('click', close);
    });

  
  //GET ALL OF THE INFORMATION
  t.list('id', 'name', 'cards')
    .then((list: any) => {
      //subtitle
      const subtitle = window.document.getElementById('subtitle');
      subtitle.innerHTML = list.name;

      //get content element
      const content = window.document.getElementById('content');

      //meta
      const meta = window.document.createElement('section');
      meta.innerHTML = '<h3>Meta Information</h3>'
        + `<div><strong>Id:</strong> ${list.id}</div>`
        + `<div><strong>Cards:</strong> ${list.cards.length}</div>`;

      content.append(meta);
    })
    .then(() => {
      loading.hide();
      return t.sizeTo('#page');
    });
});
