import { TimeService } from "./time.server";
import { env, trello } from "./_common";
import { DateHelper } from './date-helper';
import { ITimeModel } from "./time.model";
export namespace CardBadge {

  const processLocationCard = (t: any, card: any) => {
    if (card?.coordinates) {
      console.log("BADGE", {name: card.name, card});
      let timeModel:ITimeModel = null;

      return {
        dynamic: () => {
          if (timeModel == null) {
            const service = new TimeService(t);
            const {latitude, longitude} = card.coordinates;
            return service.fetchCurrentTime(latitude, longitude)
              .then((result: ITimeModel) => {
                //check for error
                if (!result) { return null; }

                //else - set the label for the model
                timeModel = result;
                timeModel.label = card.locationName ?? card.address ?? card.name;
                console.log("CURRENT TIME", {name: card.name, timeModel});
                
                return {
                  text: `${timeModel.dayOfTheWeek}: ${timeModel.time}`,
                  icon: env.logo.white,
                  color: 'sky',
                  refresh: 30
                };
              });
          }
          //else 
          console.log("BADGE UPDATE", {name: card.name, timeModel});

          return {
            text: `${timeModel.dayOfTheWeek}: ${timeModel.time}`,
            icon: env.logo.white,
            color: 'lime',
            refresh: 30
          };
        }
      };
    }
    //else
    return null;
  };


  export const build = (t, opts) => {
    const actions = [
      t.card('id', 'name', 'shortLink', 'coordinates', 'address', 'locationName')
    ];
    return trello.Promise.all(actions)
      .then(([card]) => {
        return [
          processLocationCard(t, card)
        ].filter(Boolean);
      });
  };
}
