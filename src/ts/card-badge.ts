import { env } from "./_common";

export namespace CardBadge {

  const processTestCard = (card: any) => {
    const st: string = "";
    if (card?.name.toLowerCase().indexOf('test') >= 0) {
      return {
        text: `Testing ${card.shortLink || card.idShort}`,
        icon: env.logo.gray,
        color: 'orange'
      };
    }
    //else
    return null;
  };


  export const build = (t, opts) => {
    return t.card('id', 'name', 'shortLink', 'idShort')
      .then(card => {
        console.log("DEBUG: card badge", {card, opts});
        return [
          processTestCard(card)
        ].filter(Boolean);
      });
  };
}
