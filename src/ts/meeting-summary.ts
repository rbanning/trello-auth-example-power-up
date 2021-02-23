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
      const missing = board.members.filter(bm => !card.members.any(cm => bm.id === cm.id));

      console.log("Meeting Summary", "todo: need to implement the meeting summary", {card, board, missing});      

      
      //DEBUG:  Turn off loading
      window.setTimeout( () => {
        loading.hide();
      }, 5000);

    });



});