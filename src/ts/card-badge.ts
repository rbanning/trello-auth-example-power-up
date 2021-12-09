import { TimeService } from "./time.server";
import { env, trello } from "./_common";
import { DateHelper } from './date-helper';
export namespace CardBadge {

  const processLocationCard = (t: any, card: any) => {
    if (card?.coordinates) {
      console.log("BADGE", {name: card.name, card});
      let start:number = null;
      let timestamp:number = null;
      let time:Date = null;

      return {
        dynamic: () => {
          if (time == null) {
            const service = new TimeService(t);
            const {latitude, longitude} = card.coordinates;
            return service.fetchCurrentTime(latitude, longitude)
              .then((result) => {
                start = new Date().getTime();
                timestamp = Date.parse(result.dateTime);
                console.log("CURRENT TIME", {name: card.name, start, timestamp, result});
                
                if (isNaN(timestamp)) {
                  return {
                    text: `invalid result`,
                    icon: env.logo.white,
                    color: 'red',
                    refresh: 30
                  };
                }
                //else
                time = new Date(timestamp);
                
                return {
                  text: `${DateHelper.dayOfWeek(time)}: ${DateHelper.time(time)}`,
                  icon: env.logo.white,
                  color: 'sky',
                  refresh: 30
                };
              });
          }
          //else 
          const delta = (new Date().getTime()) - start;
          console.log("BADGE", {name: card.name, start, time, timestamp, delta});

          return {
              text: `${delta}`,
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
