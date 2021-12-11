import { env } from "./_common";

export namespace CardBackSection {

  export const build = (t: any) => {
    return t.card('coordinates')
      .then((card: any) => {
        //only return a value if the card has coordinates
        return card?.coordinates ? {
          title: `Current Time`,
          icon: env.logo.gray,
          content: {
            type: 'iframe',
            url: t.signUrl('./card-back-section.html'),
            height: 300
          }
        } : null;
      });
  };

}
