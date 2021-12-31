import { Context } from "./context.namespace";
import { env, trello } from "./_common";

export namespace CardBackSection {

  export const build = (t: any) => {
    const actions = [
      trello.Promise.resolve(Context.getContext(t)),
      t.card('name', 'coordinates')
    ];
    return trello.Promise.all(actions)
      .then(([context, card]: [Context.IContext, any]) => {
        console.log("DEBUG", card.name, {context})
        //only return a value if the card has coordinates
        return card?.coordinates ? {
          title: `Auth Example`,
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
