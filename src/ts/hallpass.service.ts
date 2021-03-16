import { FetchBaseService } from "./fetch.base-service";
import { isMemberOf, trello } from "./_common";


export interface IPatchDto {
  op: string;
  path: string;
  value: string | number | boolean;
}

export class HallpassService extends FetchBaseService {

  constructor(t: any) {
    super(t);
  }  

 
  /// - Add Current User (Member) to Card
  ///     . Verify that current user is a member of the Board
  ///     . Send fetch to hallpass with DynamicIdentity headers
  ///     . Return list of members
  addMeToCurrentCard(t: any) {
    return new trello.Promise((resolve, reject) => {
      if (!t.isMemberSignedIn()) { reject("Unauthorized!"); }

      const actions = [
        t.member('id', 'fullName', 'username'),
        t.board('id', 'name', 'members', 'memberships'),
        t.card('id', 'name', 'members')
      ];

      trello.Promise.all(actions)
        .then((results: any[]) => {
          const [member, board, card] = results;
          if (isMemberOf(member.id, board.members)) {

            const url = ['cards', card.id, 'members', member.id];
            this.runFetch(url, 'PUT')
              .then((result: any[]) => {
                resolve(result);
              })
              .catch(error => {
                console.error("Error adding member to current card", error);
                reject(error);
              }); 

          } else {
            reject("Sorry - you are not a member of this board");
          }
        });
    });
  }

  /// - Remove Current User (Member) from Card
  ///     . Verify that current user is a member of the Board
  ///     . Send fetch to hallpass with DynamicIdentity headers
  ///     . Return list of members
  removeMeFromCurrentCard(t: any) {
    return new trello.Promise((resolve, reject) => {
      if (!t.isMemberSignedIn()) { reject("Unauthorized!"); }

      const actions = [
        t.member('id', 'fullName', 'username'),
        t.board('id', 'name', 'members', 'memberships'),
        t.card('id', 'name', 'members')
      ];

      trello.Promise.all(actions)
        .then((results: any[]) => {
          const [member, board, card] = results;
          if (isMemberOf(member.id, board.members)) {

            const url = ['cards', card.id, 'members', member.id];
            this.runFetch(url, 'DELETE')
              .then((result: any[]) => {
                resolve(result);
              })
              .catch(error => {
                console.error("Error removing member from current card", error);
                reject(error);
              });  

          } else {
            reject("Sorry - you are not a member of this board");
          }
        });
    });
  }

  /// - Get Card DataSet
  getCardDataSet(cardId: string) {
    return new trello.Promise((resolve, reject) => {
      const url = ['simple-data-sets', 'by-card', cardId];
      this.runFetch(url, 'GET')
        .then((result: any) => {
          resolve(result);
        })
        .catch((reason) => {
          console.error("Error getting card dataset", {reason, cardId});
          resolve(null);
        });
    });
  }


}
