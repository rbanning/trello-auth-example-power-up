import { HallpassService } from "./hallpass.service";
import { trello } from "./_common";
export var BoardMembership;
(function (BoardMembership) {
    BoardMembership.resetMembership = (target, resetTo, t = null) => {
        t = t || trello.t();
        return new trello.Promise((resolve, reject) => {
            t.board('id', 'members', 'memberships')
                .then(board => {
                //VALIDATE
                if (!Array.isArray(board === null || board === void 0 ? void 0 : board.members) || !Array.isArray(board.memberships)) {
                    reject("Unable to get board members and/or memberships");
                }
                const service = new HallpassService();
                const actions = board.memberships
                    .filter(m => m.memberType === target)
                    .map(m => {
                });
            });
        });
    };
})(BoardMembership || (BoardMembership = {}));
//# sourceMappingURL=reset-board-membership.js.map