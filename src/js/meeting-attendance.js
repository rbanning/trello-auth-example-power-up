import { HallpassService } from "./hallpass.service";
import { SettingsService } from "./settings.service";
import { isMemberOf, trello } from "./_common";
export var MeetingAttendance;
(function (MeetingAttendance) {
    MeetingAttendance.addMeToCard = (t) => {
        t.popup({
            'type': 'confirm',
            title: 'Meeting Attendance',
            message: 'Have you read or watched all of the content associated with this card?',
            confirmText: 'Yes',
            onConfirm: _addMeToCard,
            cancelText: 'No'
        });
    };
    const _addMeToCard = (t) => {
        t.closePopup();
        const service = new HallpassService();
        return service.addMeToCurrentCard(t);
    };
    MeetingAttendance.removeMeFromCard = (t) => {
        t.popup({
            'type': 'confirm',
            title: 'Meeting Attendance',
            message: 'You are marked as having read this card. Would you like to be removed?',
            confirmText: 'Remove Me',
            confirmStyle: 'danger',
            onConfirm: _removeMeFromCard,
            cancelText: 'Cancel'
        });
    };
    const _removeMeFromCard = (t) => {
        t.closePopup();
        const service = new HallpassService();
        return service.removeMeFromCurrentCard(t);
    };
    //NOTE - need to only add these badges on cards from the settings.active_list_id
    MeetingAttendance.cardDetailBadges = (t) => {
        const settingsService = new SettingsService();
        const actions = [
            settingsService.get(t),
            t.member('id'),
            t.board('id', 'members'),
            t.card('id', 'idList', 'members')
        ];
        return trello.Promise.all(actions)
            .then((results) => {
            const [settings, member, board, card] = results;
            const isMemberBoard = isMemberOf(member === null || member === void 0 ? void 0 : member.id, board === null || board === void 0 ? void 0 : board.members);
            const isMemberCard = isMemberOf(member === null || member === void 0 ? void 0 : member.id, card === null || card === void 0 ? void 0 : card.members);
            const isActiveList = card.idList === settings.active_list_id;
            if (!isActiveList || !isMemberBoard) {
                return [];
            }
            else if (isMemberCard) {
                return [
                    {
                        title: 'Attendance',
                        text: '👍 I Attended!',
                        color: 'green',
                        callback: MeetingAttendance.removeMeFromCard
                    }
                ];
            }
            else {
                return [
                    {
                        title: 'Attendance',
                        text: '⚪ Add Me to Attendance',
                        color: 'orange',
                        callback: MeetingAttendance.addMeToCard
                    }
                ];
            }
        });
    };
})(MeetingAttendance || (MeetingAttendance = {}));
;
//# sourceMappingURL=meeting-attendance.js.map