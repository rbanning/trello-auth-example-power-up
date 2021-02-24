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
  const _dbug = (t: any) => {
    console.log("DBUG - what is this", {t});
  }

  export const resetMembership = (t: any, target: MemberType, resetTo: MemberType) => {
    t.board('id', 'members', 'memberships')
      .then(board => {
        t.popup({
          type: "confirm",
          title: 'Reset Board Membership',
          message: `Change ${board.name}`,
          confirmText: 'Proceed',
          onConfirm: (t) => { console.log("Confirmed"); t.closePopup(); }
        });    
      })
  };

  export const x_resetMembership = (t: any, target: MemberType, resetTo: MemberType) => {

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

        console.log("DEBUG: - resetMembership", {board, affected, t});
        // t.modal({
        //   title: 'Testing',
        //   accentColor: 'red',
        //   url: './local-test.html',
        //   fullscreen: false,
        //   height: 300
        // });
        t.popup({
          type: "confirm",
          title: 'Reset Board Membership',
          message: "Change?",
          confirmText: 'Proceed',
          onConfirm: () => { console.log("Confirmed"); }
        });

        // t.popup({
        //   type: 'confirm',
        //   title: 'Reset Board Membership',
        //   message: `Change ${affected.length} member${affected.length === 0 ? '' : 's'} to '${resetTo}'`,
        //   confirmText: `Proceed`,
        //   onConfirm: (t) => {
        //     t.closePopup();
        //     // _resetMembership(t, board.id, affected, resetTo)
        //     //   .then(results => {
        //     //     console.log("DEBUG: updated members", {board, affected, results});
        //     //     t.alert({
        //     //       message: `Updated ${results?.length} member${results?.length === 0 ? '' : 's'}`,
        //     //       display: 'success'
        //     //     });
        //     //   })
        //     //   .catch(reason => {
        //     //     t.alert({
        //     //       message: "Error updating members",
        //     //       display: "error"
        //     //     });
        //     //   });
        //   }
        // }); //end popup
      }
    });
  
  }
}