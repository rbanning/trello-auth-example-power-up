/// THIS IS NOT PART OF THE POWER UP AND IS JUST TO TEST DYNAMIC IDENTITY
import { DynamicIdentity } from "./dynamic-identity";
const scopes = [
    {
        id: "ad6f0537-a813-4fbc-9fea-a5c3572123a6",
        code: "sandbox",
        secret: "0xAG9"
    },
    {
        id: "c20d8ccd-fe69-41a3-8936-7d61a2b848e2",
        code: "hallpass",
        secret: "0xBQ4"
    },
    {
        id: "a43db521-b3a3-4b75-9b1e-fddf4b77e5ba",
        code: "trg",
        secret: "4xWD3"
    },
    {
        id: "00392dfa-415f-4de5-b898-7bb7a94f9f37",
        code: "gwên",
        secret: "2xTV3"
    },
];
const dates = [
    new Date(2021, 1, 28),
];
const buildTests = () => {
    const ret = [];
    scopes.forEach(scope => {
        dates.forEach(date => {
            ret.push({
                scope,
                dateParts: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    dow: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()]
                }
            });
        });
    });
    return ret;
};
const URL = "https://localhost:44309/api/trello/dynamic/dynamic-identity";
const runTest = (index, scope, dateParts) => {
    console.log("===== TEST ======", index);
    var url = `${URL}?year=${dateParts.year}&month=${dateParts.month}&day=${dateParts.day}`;
    const headers = DynamicIdentity.getHeaders(scope, `test.bob-${index}.${dateParts.dow}@domain.com`, dateParts);
    const debug = {};
    headers.forEach((value, key) => {
        debug[key] = value;
    });
    console.log("Request", { url, headers: debug });
    fetch(url, { headers })
        .then((response) => {
        if (!response.ok) {
            console.error("Invalid request", { response });
            throw new Error("Aborting test");
        }
        //else
        return response.json();
    })
        .then((json) => {
        const obj = JSON.parse(json);
        console.log("Response", { obj });
    })
        .catch((error) => {
        console.warn("There was a problem with the fetch", error);
    });
    console.log('-------------------------');
    console.log('');
};
const runTests = () => {
    const tests = buildTests();
    //start with the first
    runTest(1, tests[0].scope, tests[0].dateParts);
};
runTests();
//# sourceMappingURL=test-dynamic-identity.js.map