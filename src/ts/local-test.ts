const output = document.getElementById("output");

const log = (message: string, extras?: any) => {
  console.log(message, extras);
  output.innerHTML = message;  
};

log("initializing tests...", { output });


const padded = (num: number) => {
  return `${num}`.padStart(2, "0");
};
const getTime = () => {
  const date = new Date();
  return `${padded(date.getHours())}:${padded(date.getMinutes())}:${padded(
    date.getSeconds()
  )}`;
};

const createPromise = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const time = getTime();
      log("timeout has completed", { time });
      resolve(time);
    }, 10000);
  });
};

const getResult = (pp: Promise<string>, start: string) => {
  return pp.then((result) => {
    log("got result", { start, result });
    return result;
  });
};

const runTest = (pp: Promise<string>, name: string) => {
  return getResult(pp, getTime()).then((result) => {
    log(`${name} is done`, result);
  });
};
const runTests = (pp: Promise<string>, index: number, count: number) => {
  if (index < count) {
    setTimeout(() => {
      index++;
      runTest(pp, `#${index}`);
      runTests(pp, index, count);
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
        if (even) { reject(`Button Count is ${buttonClickCount}`); }
        else { resolve(`The start time was ${result}`); }
      });
  })
  .then((message: string) => {
    log(message);
  })
  .catch((reason: string) => {
    log(reason);
  });
});

log("building promise...");
const p = createPromise();

log("starting tests...");

runTest(p, "initial");
runTests(p, 0, 15);
