import { TimeService } from "./time.server";
import { env, trello } from "./_common";
import { ITimeModel } from "./time.model";
export namespace CardBadge {

  const formatLocationTime = (model: ITimeModel) => {
    return model ? {
      text: `time`,
      icon: env.logo.white,
      color: 'sky',
    } : null;
  }

  export const build = (t, opts) => {

    const timeService = new TimeService(t);
    const actions = [
      timeService.getCardLocationTime()
    ];
    return trello.Promise.all(actions)
      .then(([timeModel]: [ITimeModel]) => {
        console.log("PROMISES FINISHED", {timeModel});
        return [
          formatLocationTime(timeModel)
        ].filter(Boolean);
      });
  };
}
