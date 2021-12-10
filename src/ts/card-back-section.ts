import { AboutPage } from "./about-page";
import { ITimeModel } from "./time.model";
import { TimeService } from "./time.server";
import { env } from "./_common";

export namespace CardBackSection {

  export const build = (t: any) => {
    return t.card('coordinates')
      .then((card: any) => {
        //only return a value if the card has coordinates
        return card?.coordinates ? {
          title: `Current Time`,
          icon: env.logo.color,
          content: {
            type: 'iframe',
            url: t.signUrl('./card-back-section.html'),
            height: 300
          }
        } : null;
      });
  };

}
