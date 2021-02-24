import { FetchBaseService } from "./fetch.base-service";
import { isMemberOf, trello } from "./_common";
export class HallpassService extends FetchBaseService {
    constructor() {
        super();
    }
    /// - Add Current User (Member) to Card
    ///     . Verify that current user is a member of the Board
    ///     . Send fetch to hallpass with DynamicIdentity headers
    ///     . Return list of members
    addMeToCurrentCard(t) {
        return new trello.Promise((resolve, reject) => {
            if (!t.isMemberSignedIn()) {
                reject("Unauthorized!");
            }
            const actions = [
                this.settingsService.get(t),
                t.member('id', 'fullName', 'username'),
                t.board('id', 'name', 'members', 'memberships'),
                t.card('id', 'name', 'members')
            ];
            trello.Promise.all(actions)
                .then((results) => {
                const [settings, member, board, card] = results;
                if (isMemberOf(member.id, board.members)) {
                    const url = this.buildUrl(settings, 'cards', card.id, 'members', member.id);
                    this.fetchUsingSettingsAndMember(url, 'PUT', settings, member)
                        .then((result) => {
                        resolve(result);
                    })
                        .catch(error => {
                        console.error("Error adding member to current card", error);
                        reject(error);
                    });
                }
                else {
                    reject("Sorry - you are not a member of this board");
                }
            });
        });
    }
    /// - Remove Current User (Member) from Card
    ///     . Verify that current user is a member of the Board
    ///     . Send fetch to hallpass with DynamicIdentity headers
    ///     . Return list of members
    removeMeFromCurrentCard(t) {
        return new trello.Promise((resolve, reject) => {
            if (!t.isMemberSignedIn()) {
                reject("Unauthorized!");
            }
            const actions = [
                this.settingsService.get(t),
                t.member('id', 'fullName', 'username'),
                t.board('id', 'name', 'members', 'memberships'),
                t.card('id', 'name', 'members')
            ];
            trello.Promise.all(actions)
                .then((results) => {
                const [settings, member, board, card] = results;
                if (isMemberOf(member.id, board.members)) {
                    const url = this.buildUrl(settings, 'cards', card.id, 'members', member.id);
                    this.fetchUsingSettingsAndMember(url, 'DELETE', settings, member)
                        .then((result) => {
                        resolve(result);
                    })
                        .catch(error => {
                        console.error("Error removing member from current card", error);
                        reject(error);
                    });
                }
                else {
                    reject("Sorry - you are not a member of this board");
                }
            });
        });
    }
    /// - Change membership on a board
    updateBoardMembership(id, memberType) {
        return new trello.Promise((resolve, reject) => {
            const actions = [];
            trello.Promise.all(actions)
                .then((results) => {
                const [settings, member, board, card] = results;
                if (isMemberOf(member.id, board.members)) {
                    const url = this.buildUrl(settings, 'cards', card.id, 'members', member.id);
                    this.fetchUsingSettingsAndMember(url, 'DELETE', settings, member)
                        .then((result) => {
                        resolve(result);
                    })
                        .catch(error => {
                        console.error("Error removing member from current card", error);
                        reject(error);
                    });
                }
                else {
                    reject("Sorry - you are not a member of this board");
                }
            });
        });
    }
}
//# sourceMappingURL=hallpass.service.js.map