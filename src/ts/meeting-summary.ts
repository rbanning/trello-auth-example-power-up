import { LoadingService } from "./loading.service";
import { trello } from "./_common";

const t = trello.t();
const loading = new LoadingService();
loading.show();

//get the card
const card = t.arg('card');
console.log("Meeting Summary", "todo: need to implement the meeting summary", {card});

//HELPERS
const close = () => {
  trello.t().closePopup();
};


//SETUP CLOSE BUTTON
window.document.querySelectorAll('.close')
  .forEach(btn => {
    btn.addEventListener('click', close);
  });


//DEBUG:  Turn off loading
window.setTimeout( () => {
  loading.hide();
}, 5000);