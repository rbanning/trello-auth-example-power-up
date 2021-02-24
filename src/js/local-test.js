const output = document.getElementById("output");
const log = (message, extras) => {
    console.log(message, extras);
    output.innerHTML = message;
};
log("initializing tests...", { output });
const padded = (num) => {
    return `${num}`.padStart(2, "0");
};
const getTime = () => {
    const date = new Date();
    return `${padded(date.getHours())}:${padded(date.getMinutes())}:${padded(date.getSeconds())}`;
};
const createPromise = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const time = getTime();
            log("timeout has completed", { time });
            resolve(time);
        }, 10000);
    });
};
const getResult = (p, start) => {
    return p.then((result) => {
        log("got result", { start, result });
        return result;
    });
};
const runTest = (p, name) => {
    return getResult(p, getTime()).then((result) => {
        log(`${name} is done`, result);
    });
};
const runTests = (p, index, count) => {
    if (index < count) {
        setTimeout(() => {
            index++;
            runTest(p, `#${index}`);
            runTests(p, index, count);
        }, 1000);
    }
};
log("setting up button handler...");
let buttonClickCount = 0;
document.getElementById('run').addEventListener('click', () => {
    buttonClickCount++;
    return new Promise((resolve, reject) => {
        const even = buttonClickCount % 2 === 0;
        return getResult(p, 'Button')
            .then((result) => {
            if (even) {
                reject(`Button Count is ${buttonClickCount}`);
            }
            else {
                resolve(`The start time was ${result}`);
            }
        });
    })
        .then((message) => {
        log(message);
    })
        .catch((reason) => {
        log(reason);
    });
});
log("building promise...");
const p = createPromise();
log("starting tests...");
runTest(p, "initial");
runTests(p, 0, 15);
//# sourceMappingURL=local-test.js.map