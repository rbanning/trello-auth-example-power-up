import { LoadingService } from "./loading.service";
import { trello } from "./_common";

const t = trello.t();
const loading = new LoadingService();
loading.show();

const getElementSafely = (id: string) => {
  const ret = window.document.getElementById(id);
  if (!ret) {
    console.error("Could not find the requested DOM element", {id});
  }
  return ret;
}
const getTitleElement = () => getElementSafely('title');
const getSubTitleElement = () => getElementSafely('subtitle');
const getContentElement = () => getElementSafely('content');

const showError = (message: string) => {
  const content = getContentElement();
  if (content) {
    content.innerHTML = `<p class="error"><strong>Oops - </strong><br/>${message}</p>`
  }
  loading.hide();
}

t.render(() => {

  let card: any = null;

  try {
    t.card('id', 'name')
      .then((_card: any) => {
        card = _card; //save
        //else .. build the page
        const title = getTitleElement();
        const subtitle = getSubTitleElement();
        const content = getContentElement();

        if (title) {
          title.innerHTML = card.name;
        }
        if (subtitle) {
          subtitle.innerHTML = 'Testing';
        }
        if (content) {
          content.innerHTML = `Content Goes Here`;
        }
        
        loading.hide();
        return t.sizeTo('#page');
      });    
  } catch (error) {
    console.error("Unhandled error building back section", {card, error});
    const message: string = typeof(error) === 'string' ? error 
      : "Could not get time";
    showError(message);
  }

});
