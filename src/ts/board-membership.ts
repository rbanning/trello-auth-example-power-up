import { HallpassService } from "./hallpass.service";
import { trello } from "./_common";


export namespace BoardMembership {

  export type MemberType = 'admin' | 'normal' | 'observer';

  export const resetMembership = (t: any, target: MemberType, resetTo: MemberType) => {
    return new trello.Promise((resolve, reject) => {

      t.board('id', 'members', 'memberships')
      .then(board => {
        //VALIDATE
        if (!Array.isArray(board?.members) || !Array.isArray(board.memberships)) {
          reject("Unable to get board members and/or memberships");
        }

        const service = new HallpassService(t);
        const affected = board.memberships
                        .filter(m => m.memberType === target);

        if (affected.length === 0) {
          resolve([]);  //no action need to take place
        } else {
          const actions = affected
          .map(m => {
            return service.updateBoardMembership(board.id, m.idMember, 'observer');
          });
          trello.Promise.all(actions)
            .then(resolve)
            .catch(reason => {
              console.warn("An error occurred while updating board membership", {board, affected, reason});
              reject("An error occurred while updating board membership(s)");
            });
        }
      });

    });
    
  }
}