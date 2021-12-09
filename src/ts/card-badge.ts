import { env, trello } from "./_common";

export namespace CardBadge {

  const processLocationCard = (card: any) => {
    if (card?.coordinates) {
      console.log("BADGE", {name: card.name, card});
      let count:number = null;
      return {
        dynamic: () => {
          console.log("BADGE", {name: card.name, count});
          count = (count == null) ? 1000 : (count + 1);
          return {
              text: `${count}: ${card.locationName}`,
              icon: env.logo.white,
              color: 'sky',
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
          processLocationCard(card)
        ].filter(Boolean);
      });
  };
}
