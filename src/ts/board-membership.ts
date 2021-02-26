import { HallpassService } from "./hallpass.service";
import { trello } from "./_common";


export namespace BoardMembership {

  export type MemberType = 'admin' | 'normal' | 'observer';

  const _resetMembership = (t: any, boardId, memberIds: string[], resetTo: MemberType) => {
    return new trello.Promise((resolve, reject) => {
        if (memberIds.length === 0) {
          resolve([]);  //no action need to take place
        } else {
          const service = new HallpassService(t);
          const actions = memberIds
            .map(m => {
              return service.updateBoardMembership(boardId, m, resetTo);
            });
          trello.Promise.all(actions)
            .then(resolve)
            .catch(reason => {
              console.warn("An error occurred while updating board membership", {boardId, memberIds, reason});
              reject("An error occurred while updating board membership(s)");
            });
        }
    });
    
  }
  export const resetMembership = (t: any, target: MemberType, resetTo: MemberType) => {

    t.board('id', 'members', 'memberships')
    .then(board => {
      //VALIDATE
      if (!Array.isArray(board?.members) || !Array.isArray(board.memberships)) {
        console.warn("Unable to get board members and/or memberships", {board});
        return;
      }

      const affected = board.memberships
                      .filter(m => m.memberType === target)
                      .map(m => m.idMember);

      if (affected.length === 0) {
        
        t.alert({
          message: 'No members need updating',
          display: 'warning'
        });

      } else {
        
        _resetMembership(t, board.id, affected, resetTo)
          .then(results => {
            console.log("DEBUG: updated members", {board, affected, results});
            t.alert({
              message: `Updated ${results?.length} member${results?.length === 0 ? '' : 's'}`,
              display: 'success'
            });
          })
          .catch(() => {
            t.alert({
              message: "Error updating members",
              display: "error"
            });
          });
      }
    });
  
  }
}