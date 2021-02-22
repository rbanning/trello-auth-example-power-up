import { HallpassService } from "./hallpass.service";
import { SettingsService } from "./settings.service";
import { isMemberOf, trello } from "./_common";

export namespace MeetingAttendance {

  export const addMeToCard = (t) => {
    const service = new HallpassService();
    return service.addMeToCurrentCard(t);
  };

  export const removeMeFromCard = (t) => {
    const service = new HallpassService();
    return service.removeMeFromCurrentCard(t);
  };


  //NOTE - need to only add these badges on cards from the settings.list_id
  export const cardDetailBadges = (t): Promise<any[]> => {
    const settingsService = new SettingsService();
    const actions =[ 
      settingsService.get(t),
      t.member('id'),
      t.board('id','members'),
      t.card('id', 'idList', 'members')
    ];
    return trello.Promise.all(actions)
      .then((results: any[]) => {
        const [settings, member, board, card] = results;
        const isMemberBoard = isMemberOf(member?.id, board?.members);
        const isMemberCard = isMemberOf(member?.id, card?.members);
        const isActiveList = card.idList === settings.list_id;
        console.log("DEBUG: - cardDetailBadges", {member, card, isMemberBoard, isMemberCard, isActiveList});
        
        return [
          {
            title: 'Attendance',
            text: '⚪ Add Me to Card',
            color: 'orange',
            callback: addMeToCard
          },
          {
            title: 'Attendance',
            text: '👍 I am on this Card',
            color: 'green',
            callback: removeMeFromCard
          }
        ];
      });
  }

};



