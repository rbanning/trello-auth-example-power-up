import { CustomFields } from "./custom-fields";
import { env, trello } from "./_common";

export namespace CardBadge {

  const processTestCard = (card: any) => {
    const st: string = "";
    if (card?.name.toLowerCase().indexOf('test') >= 0) {
      return {
        text: `Testing ${card.shortLink}`,
        icon: env.logo.white,
        color: 'orange'
      };
    }
    //else
    return null;
  };


  export const build = (t, opts) => {
    const actions = [
      t.board('customFields'),
      t.card('id', 'name', 'shortLink', 'customFieldItems')
    ];
    return trello.Promise.all(actions)
      .then((board, card) => {
        const customFields = CustomFields.build(board.customFields, card.customFieldItems);
        console.log("DEBUG: card badge", {board, card, customFields});
        return [
          processTestCard(card)
        ].filter(Boolean);
      });
  };
}
