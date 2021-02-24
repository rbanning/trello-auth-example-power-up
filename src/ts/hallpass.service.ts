import { FetchBaseService } from "./fetch.base-service";
import { ISettings, SettingsService } from "./settings.service";
import { isMemberOf, trello } from "./_common";

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
        t.member('id','fullName','username'),
        t.board('id','name','members','memberships'),
        t.card('id','name','members')
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
        t.member('id','fullName','username'),
        t.board('id','name','members','memberships'),
        t.card('id','name','members')
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

  
  /// - Change membership on a board
  updateBoardMembership(boardId: string, memberId: string, memberType: string) {
    return new trello.Promise((resolve, reject) => {
      const url = ['boards', boardId, 'members', memberId];
      const patch = { op: 'replace', path: '/membership', value: memberType };
      this.runFetch(url, 'PATCH', patch)
        .then((results: any[]) => {
          if (Array.isArray(results)) {
            resolve(results.find(m => m.id === memberId));
          }
          //else
          console.warn("Problem updating board membership", {results, boardId, memberId, memberType});
          reject("Problem updating board membership");
        })
        .catch((reason) => {
          console.error("Error updating board membership", {reason, boardId, memberId, memberType});
          reject(reason);
        });
    });
  }



  /// - Get Board (this is really just for testing)
  getBoard(boardId: string) {
    const url = ['boards', boardId];
    return this.runFetch(url, 'GET')
  }

}