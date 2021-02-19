import { LoadingService } from "./loading.service";
import { trello } from "./_common";
const t = trello.t();
const loading = new LoadingService();
loading.show();
console.log("Meeting Summary", "todo: need to implement the meeting summary");
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
window.setTimeout(() => {
    loading.hide();
}, 5000);
//# sourceMappingURL=meeting-summary.js.map