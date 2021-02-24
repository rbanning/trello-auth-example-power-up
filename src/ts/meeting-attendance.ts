import { HallpassService } from "./hallpass.service";
import { SettingsService } from "./settings.service";
import { isMemberOf, trello } from "./_common";

export namespace MeetingAttendance {

  export const addMeToCard = (t) => {
    t.popup({
      'type': 'confirm',
      title: 'Meeting Attendance',
      message: 'Have you read or watched all of the content associated with this card?',
      confirmText: 'Yes',
      onConfirm: _addMeToCard,
      cancelText: 'No'
    });
  };
  const _addMeToCard = (t) => {
    t.closePopup();
    const service = new HallpassService(t);
    return service.addMeToCurrentCard(t);
  };

  export const removeMeFromCard = (t) => {
    t.popup({
      'type': 'confirm',
      title: 'Meeting Attendance',
      message: 'You are marked as having read this card. Would you like to be removed?',
      confirmText: 'Remove Me',
      confirmStyle: 'danger',
      onConfirm: _removeMeFromCard,
      cancelText: 'Cancel'
    });
  };
  const _removeMeFromCard = (t) => {
    t.closePopup();
    const service = new HallpassService(t);
    return service.removeMeFromCurrentCard(t);
  };


  //NOTE - need to only add these badges on cards from the settings.active_list_id
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
        const isActiveList = card.idList === settings.active_list_id;
        
        if (!isActiveList || !isMemberBoard) { return []; }
        else if (isMemberCard) {
          return [
            {
              title: 'Attendance',
              text: '👍 I Attended!',
              color: 'green',
              callback: removeMeFromCard
            }          
          ];
  
        } else {
          return [
            {
              title: 'Attendance',
              text: '⚪ Add Me to Attendance',
              color: 'orange',
              callback: addMeToCard
            }          
          ];
  
        }
      });
  }

};



