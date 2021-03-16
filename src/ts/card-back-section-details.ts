import { LoadingService } from "./loading.service";
import { HallpassService } from "./hallpass.service";
import { trello } from "./_common";

const t = trello.t();
const loading = new LoadingService();
loading.show();


t.render(() => {




  const hallpassService = new HallpassService(t);

  //GET ALL OF THE INFORMATION
  t.card('id', 'name')
    .then((card: any) => {

      //subtitle
      const subtitle = window.document.getElementById('subtitle');
      subtitle.innerHTML = card.name;


      return hallpassService.getCardDataSet(card.id);
    })
    .then((result: any) => {
        //content
        const content = window.document.getElementById('content');

        if (result?.data) {
          content.innerHTML = result.data;
        } else {
          content.innerHTML = '<p class="error">Sorry - nothing to display</p>';
        }

        loading.hide();
        return t.sizeTo('#page');
    });
});
