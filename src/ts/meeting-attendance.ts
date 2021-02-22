import { HallpassService } from "./hallpass.service";
import { trello } from "./_common";

export namespace MeetingAttendance {

  export const addMeToCard = (t) => {
    const service = new HallpassService();
    return service.addMeToCurrentCard(t);
  };

  export const removeMeFromCard = (t) => {
    const service = new HallpassService();
    return service.removeMeFromCurrentCard(t);
  };

  export const cardDetailBadges = (t): any[] => {
    const actions =[ 
      t.member('id'),
      t.card('id','members')
    ];
    return trello.Promise.all(actions)
      .then((results: any[]) => {
        const [member, card] = results;
        console.log("DEBUG: - cardDetailBadges", {member, card});
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
        ]
      })
  }

};



