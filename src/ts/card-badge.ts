import { STORAGE_KEY, TimeService } from "./time.server";
import { env, trello } from "./_common";
import { ITimeModel } from "./time.model";
import { StorageService } from "./storage.service";
export namespace CardBadge {

  const processLocationCard = (t: any, card: any) => {
    if (card?.coordinates) {
      console.log("BADGE", {name: card.name, card});
      let timeModel:ITimeModel = null;

      const service = new TimeService(t);
      const {latitude, longitude} = card.coordinates;
      return service.getCurrentTime(latitude, longitude)
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
          };
        });

      // return {
      //   dynamic: () => {
      //     if (timeModel == null) {
      //       const service = new TimeService(t);
      //       const {latitude, longitude} = card.coordinates;
      //       return service.getCurrentTime(latitude, longitude)
      //         .then((result: ITimeModel) => {
      //           //check for error
      //           if (!result) { return null; }

      //           //else - set the label for the model
      //           timeModel = result;
      //           timeModel.label = card.locationName ?? card.address ?? card.name;
      //           console.log("CURRENT TIME", {name: card.name, timeModel});
                
      //           return {
      //             text: `${timeModel.dayOfTheWeek}: ${timeModel.time}`,
      //             icon: env.logo.white,
      //             color: 'sky',
      //             refresh: 30
      //           };
      //         });
      //     }
      //     //else 
      //     console.log("BADGE UPDATE", {name: card.name, timeModel});

      //     return {
      //       text: `${timeModel.dayOfTheWeek}: ${timeModel.time}`,
      //       icon: env.logo.white,
      //       color: 'lime',
      //       refresh: 30
      //     };
      //   }
      // };
    }
    //else
    return null;
  };

  const debugLocationCard = (t: any, card: any) => {
    return {
      text: `time`,
      icon: env.logo.white,
      color: 'sky',
    };
  }

  export const build = (t, opts) => {
    const storage = new StorageService();
    const actions = [
      t.card('id', 'name', 'shortLink', 'coordinates', 'address', 'locationName'),
      t.get('card', storage.visibility, STORAGE_KEY)
    ];
    return trello.Promise.all(actions)
      .then(([card, storage]) => {
        console.log("PROMISES FINISHED", {card, storage});
        return [
          debugLocationCard(t, card)
        ].filter(Boolean);
      });
  };
}
