import { FetchBaseService } from "./fetch.base-service";
import { ISettings, SettingsService } from "./settings.service";
import { isMemberOf, trello } from "./_common";

export class HallpassService extends FetchBaseService {

  constructor() {
    super();
  }  

 
  /// - Add Current User (Member) to Card
  ///     . Verify that current user is a member of the Board
  ///     . Send fetch to hallpass with DynamicIdentity headers
  ///     . Return list of members
  addMeToCurrentCard(t: any) {
    return new trello.Promise((resolve, reject) => {
      if (!t.isMemberSignedIn()) { reject("Unauthorized!"); }

      const actions = [
        this.settings.get(t),
        t.member('id','fullName','username'),
        t.board('id','name','members','memberships'),
        t.card('id','name','members')
      ];

      trello.Promise.all(actions)
        .then((results: any[]) => {
          const [settings, member, board, card] = results;
          if (isMemberOf(member.id, board.members)) {

            console.log("DEBUG: - addMeToCurrentCard", {settings, member, board, card});

            const url = this.buildUrl(settings, 'cards', card.id, 'members', member.id);
            this.fetchUsingSettingsAndMember(url, 'PUT', settings, member)
              .then((result: any[]) => {
                console.log("DEBUG: - addMeToCurrentCard ... should have gotten list of members on the card", result);
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
        this.settings.get(t),
        t.member('id','fullName','username'),
        t.board('id','name','members','memberships'),
        t.card('id','name','members')
      ];

      trello.Promise.all(actions)
        .then((results: any[]) => {
          const [settings, member, board, card] = results;
          if (isMemberOf(member.id, board.members)) {

            console.log("DEBUG: - removeMeFromCurrentCard", {settings, member, board, card});

            const url = this.buildUrl(settings, 'cards', card.id, 'members', member.id);
            this.fetchUsingSettingsAndMember(url, 'DELETE', settings, member)
              .then((result: any[]) => {
                console.log("DEBUG: - removeMeFromCurrentCard ... should have gotten list of members on the card", result);
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

  
}