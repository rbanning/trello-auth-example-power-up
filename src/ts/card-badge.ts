import { CustomFields } from "./custom-fields";
import { env, trello } from "./_common";

export namespace CardBadge {

  const processTestCard = (card: any, customFields: CustomFields.ICustomFields[]) => {
    if (customFields?.length > 0) {
      const existing = customFields.filter(m => m.raw).length;
      return {
        text: `${card.shortLink} ${existing}/${customFields.length}`,
        icon: env.logo.white,
        color: existing === customFields.length ? 'green' : 'orange'
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
      .then(([board, card]) => {
        const customFields = CustomFields.build(board.customFields, card.customFieldItems);
        return [
          processTestCard(card, customFields)
        ].filter(Boolean);
      });
  };
}
