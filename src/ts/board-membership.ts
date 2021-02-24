import { HallpassService } from "./hallpass.service";
import { trello } from "./_common";


export namespace BoardMembership {

  export type MemberType = 'admin' | 'normal' | 'observer';

  export const resetMembership = (target: MemberType, resetTo: MemberType, t: any = null) => {
    t = t || trello.t();

    return new trello.Promise((resolve, reject) => {

      t.board('id', 'members', 'memberships')
      .then(board => {
        //VALIDATE
        if (!Array.isArray(board?.members) || !Array.isArray(board.memberships)) {
          reject("Unable to get board members and/or memberships");
        }

        const service = new HallpassService(t);
        const actions = board.memberships
                        .filter(m => m.memberType === target)
                        .map(m => {
                          return m;
                        });

        console.log("DEBUG: resetMembership", {board, actions});
        service.getBoard(board.id)
                        .then(result => {
                          console.log("DEBUG: board information", result);
                          resolve(null);
                        })
                        .catch(reason => {
                          console.error("DEBUG: board information FAILED", {reason});
                        });
      });

    });
    
  }
}