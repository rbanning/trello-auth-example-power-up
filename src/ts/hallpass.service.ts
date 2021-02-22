import { SettingsService } from "./settings.service";
import { trello } from "./_common";

export class HallpassService {
  private settings: SettingsService;

  constructor() {
    this.settings = new SettingsService();
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
          console.log("DEBUG: - addMeToCurrentCard", {settings, member, board, card});
          resolve(true);
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
          console.log("DEBUG: - removeMeToCurrentCard", {settings, member, board, card});
          resolve(true);
        });
    });
  }

  
}