import { LoadingService } from "./loading.service";
import { HallpassService } from "./hallpass.service";
import { trello } from "./_common";
import { TimeService } from "./time.server";
import { ITimeModel } from "./time.model";

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

  const timeService = new TimeService(t);
  let card: any = null;

  try {
    t.card('id', 'name', 'coordinates', 'address', 'locationName')
      .then((_card: any) => {
        card = _card; //save
        return timeService.getCardLocationTime(card);
      })
      .then((model: ITimeModel) => {
        if (!model) {
          console.warn("Problem getting the current time", {card, model});
          showError("Could not located the current time");
          return null;
        }

        //else .. build the page
        const title = getTitleElement();
        const subtitle = getSubTitleElement();
        const content = getContentElement();

        if (title) {
          title.innerHTML = card.locationName;
        }
        if (subtitle) {
          subtitle.innerHTML = model.timezone;
        }
        if (content) {
          content.innerHTML = `${model.dayOfTheWeek} - ${model.time}`;
          //update every 20 seconds
          window.setInterval(() => {
            content.innerHTML = `${model.dayOfTheWeek} - ${model.time}`;
          }, 20 * 1000);
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
