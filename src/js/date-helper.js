export var DateHelper;
(function (DateHelper) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    DateHelper.monthLong = (d) => {
        if (d.getMonth) {
            return months[d.getMonth()];
        }
        //else
        return '';
    };
    DateHelper.monthShort = (d) => {
        if (d.getMonth) {
            return months[d.getMonth()].substring(0, 3);
        }
        //else
        return '';
    };
    DateHelper.dateMedium = (d) => {
        if (d.getMonth) {
            return `${DateHelper.monthShort(d)}. ${d.getDate().toString().padStart(2, '0')}, ${d.getFullYear()}`;
        }
        //else
        return '';
    };
})(DateHelper || (DateHelper = {}));
//# sourceMappingURL=date-helper.js.map