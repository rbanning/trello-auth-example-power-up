export var DynamicIdentity;
(function (DynamicIdentity) {
    const HEADER_KEYS = {
        "scope-id": "X-Hallpass-Scope",
        "scope-code": "X-Hallpass-Scope-Code",
        "challenge": "X-Hallpass-DynamicIdentity-Challenge",
        "code": "X-Hallpass-DynamicIdentity-Code",
        "user": "X-Hallpass-DynamicIdentity-User",
    };
    const headerKeys = () => {
        return Object.assign({}, HEADER_KEYS); //clone
    };
    //#region >> HELPERS << 
    const randomizeArray = (array, passes = 1) => {
        let tempValue = null, randomIndex = null;
        for (let pass = 0; pass < passes; pass++) {
            for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                tempValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = tempValue;
            }
        }
        return array;
    };
    const _CHARS = "abcdefghijklmnopqrstuvwxyz1234567890".split('');
    let CHARS = null;
    const getRandomCharsFrom = (values, count) => {
        //convert values to array
        if (typeof (values) === 'string') {
            values = values.split('');
        }
        let ret = "";
        for (let i = 0; i < count; i++) {
            ret += values[Math.floor(Math.random() * values.length)];
        }
        return ret;
    };
    const getRandomChars = (count) => {
        //initialize
        if (!CHARS) {
            CHARS = randomizeArray(_CHARS, 3);
        }
        return getRandomCharsFrom(CHARS, count);
    };
    //#endregion
    DynamicIdentity.isValidScope = (scope) => {
        var _a, _b, _c;
        return !!scope &&
            ((_a = scope.id) === null || _a === void 0 ? void 0 : _a.length) > 30 &&
            ((_b = scope.code) === null || _b === void 0 ? void 0 : _b.length) >= 3 &&
            ((_c = scope.secret) === null || _c === void 0 ? void 0 : _c.length) >= 5;
    };
    DynamicIdentity.buildChallenge = (scope, user) => {
        if (!DynamicIdentity.isValidScope(scope)) {
            console.warn("Cannot build Dynamic Identity challenge: Invalid Scope", { scope });
            return null;
        }
        const sections = ['', '', ''];
        const date = new Date();
        const d = {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
            dow: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getUTCDay()]
        };
        let parts = null;
        let putAnyWhere = null;
        //section one
        let length = 5 + d.month % 3;
        //number of random chars is length - required chars (3)
        putAnyWhere = [scope.code[0], getRandomCharsFrom(scope.secret, 1), getRandomChars(length - 3)];
        parts = [
            ...randomizeArray(([...putAnyWhere]).join('').split('')),
            d.dow[d.dow.length - 1]
        ];
        sections[0] = parts.join('');
        //section two
        length = 3 + d.day % 3;
        //number of random chars is length - required chars (2)
        putAnyWhere = [getRandomCharsFrom(scope.secret, 1), getRandomChars(length - 2)];
        parts = [
            ...randomizeArray(([...putAnyWhere]).join('').split('')),
            d.dow[1]
        ];
        sections[1] = parts.join('');
        //section three
        length = 8 + d.year % 3;
        //number of random chars is length - required chars (7)
        putAnyWhere = [scope.code[1], scope.code[2], getRandomCharsFrom(scope.secret, 1), user.substr(0, 3), getRandomChars(length - 7)];
        parts = [
            d.dow[0],
            ...randomizeArray(([...putAnyWhere]).join('').split('')),
        ];
        sections[2] = parts.join('');
        return sections.join('-').toLowerCase();
    };
    DynamicIdentity.buildCode = (scope, user, challenge) => {
        if (!DynamicIdentity.isValidScope(scope)) {
            console.warn("Cannot build Dynamic Identity code: Invalid scope", { scope });
            return null;
        }
        if (!challenge || challenge.length < 16) {
            console.warn("Cannot build Dynamic Identity code: Invalid challenge", { challenge });
            return null;
        }
        if (!user || user.length < 3) {
            console.warn("Cannot build Dynamic Identity code: Invalid user", { user });
            return null;
        }
        //convert challenge to sections (three)
        const sections = challenge.split('-');
        if (sections.length !== 3) {
            return null;
        }
        const length = scope.id.length;
        return scope.id[sections[1].length % length] + //1
            scope.id[challenge.length % length] + //2
            scope.id[sections[0].length % length] + //3
            scope.id[user.length % length] + //4
            scope.id[sections[2].length % length] + //5
            scope.id[challenge.charCodeAt(0) % length]; //6
    };
    DynamicIdentity.getHeaders = (scope, user) => {
        if (!scope) {
            throw new Error("Missing/Invalid scope");
        }
        if (!user) {
            throw new Error("Missing/Invalid user");
        }
        const challenge = DynamicIdentity.buildChallenge(scope, user);
        const code = DynamicIdentity.buildCode(scope, user, challenge);
        const headers = new Headers();
        headers.append(HEADER_KEYS["scope-id"], scope.id);
        headers.append(HEADER_KEYS["scope-code"], scope.code);
        headers.append(HEADER_KEYS.challenge, challenge);
        headers.append(HEADER_KEYS.code, code);
        headers.append(HEADER_KEYS.user, user);
        return headers;
    };
})(DynamicIdentity || (DynamicIdentity = {}));
//# sourceMappingURL=dynamic-identity.js.map