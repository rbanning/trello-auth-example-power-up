import { MeetingSummaryPopup } from "./meeting-summary-popup";
import { SettingsService } from "./settings.service";
import { trello, getBoardMembers, env } from "./_common";
export var BoardButtons;
(function (BoardButtons) {
    BoardButtons.build = (t) => {
        const settingsService = new SettingsService();
        return trello.Promise.all([
            settingsService.get(t),
            getBoardMembers(t)
        ])
            .then(([settings, members]) => {
            //VALIDATION
            if (!settings) {
                console.warn("Unable to retrieve settings", { settings });
                return [];
            }
            if (!Array.isArray(members)) {
                console.warn("Unable to retrieve board members", { members });
                return [];
            }
            const me = members.find(m => m.isMe);
            if (!me) {
                console.warn("Unable to find me within board members", { members, me });
                return [];
            }
            //ONLY ADMINS GET BUTTONS
            if (me.isAdmin) {
                var result = [
                    {
                        text: 'View Attendance',
                        icon: {
                            dark: env.logo.white,
                            light: env.logo.black
                        },
                        condition: 'edit',
                        callback: MeetingSummaryPopup.show
                    }
                ];
                if (settings.monitor_members === 'true' && members.some(m => { var _a; return ((_a = m.membership) === null || _a === void 0 ? void 0 : _a.memberType) === 'normal'; })) {
                    result.push({
                        text: "Reset 'normal' Members",
                        icon: null,
                        condition: 'edit',
                        callback: (t) => {
                            console.log("DEBUG: implement Reset 'normal' Members");
                        }
                    });
                }
                return result;
            }
        });
    };
})(BoardButtons || (BoardButtons = {}));
//# sourceMappingURL=board-buttons.js.map