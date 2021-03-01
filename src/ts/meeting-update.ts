import { DateHelper } from "./date-helper";
import { IPatchDto } from "./hallpass.service";
import { SettingsService } from "./settings.service"
import { trello } from "./_common";

export namespace MeetingUpdate {


  const getModifications = (settings, card): IPatchDto[] => {
    if (!settings || !card) { 
      console.warn("Unable to get modification", {settings, card});
      return null;
    }

    const moveCardModification = (card: any, targetListId: string): IPatchDto => {
      return (card.idList !== targetListId) ? { op: "replace", path: "/idList", value: targetListId } : null;
    }
    const completeCardModification = (card: any, targetComplete: boolean): IPatchDto => {
      return (card.dueComplete !== targetComplete) ? { op: "replace", path: "/dueComplete", value: targetComplete} : null; 
    }

    //modification if one of the following is not true
    //  a card with a recently expired due date should be in the active list and marked dueComplete
    //  a card with an old expired due date should be in the completed list (and marked dueComplete)
    //  a card with an un-expired due date should not be in either the active or completed list.

    const modifications: IPatchDto[] = [];

    switch (DateHelper.isExpired(card.due)) {
      case true:
        
        break;
      case false:
        break;

      case null:
      default:
        //there is no due date
        break;  
    }
    
    console.log("getCarModification - ", {card});
    return modifications;
  }

  const buildModificationList = (t) => {
    const actions = [
      (new SettingsService()).get(t),
      t.cards('id', 'name', 'due', 'dueComplete', 'closed', 'idList')
    ];

    return trello.Promise.all(actions)
      .then(([settings, cards]) => {
        const modifications: IPatchDto[] = cards.map(card => getModifications(settings, card)).flat().filter(Boolean);

        console.log("DEBUG: // modifications", {settings, cards, modifications});
        return modifications;
      });
  }

  export const updateBoardMeetingCards = (t) => {
    return buildModificationList(t)
      .then(modifications => {

        //todo: send the patches to backend

        return [];
      });

  }

}