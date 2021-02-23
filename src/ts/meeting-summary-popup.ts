import { SettingsService } from "./settings.service"
import { trello } from "./_common";

export namespace MeetingSummaryPopup {

  const closePopup = (t) => { t.closePopup(); };

  const showMeetingSummaryFor = (card) => {
    return (t) => {
      t.popup({
        text: 'Meeting Summary',
        url: './meeting-summary.html',
        args: { card },
        height: 200
      });
    };
  };

  export const show = (t) => {
    const settingsService = new SettingsService();
    const actions = [
      settingsService.get(t),
      t.cards('id','name','due','dueComplete','closed','members','dateLastActivity')
    ];
    
    return trello.Promise.all(actions)
      .then(([settings, cards]) => {
        cards = Array.isArray(cards) ? cards.filter(c => !c.closed && c.dueComplete) : [];
        cards.sort((a,b) => b.dateLastActivity.localCompare(a.dateLastActivity)); //sort by date last activity DESC

        const items = [];
        if (cards.length === 0) {
          items.push({
            text: 'No meeting cards found',
            callback: closePopup
          });
        } else {
          cards.forEach(card => {
            items.push({
              text: card.name,
              callback: showMeetingSummaryFor(card)
            });
          });
        }

        return t.popup({
          text: 'Meeting Summary',
          items
        });
      });
  };
}