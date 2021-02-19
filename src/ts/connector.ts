import {env} from './_common';

const connector: any = {
  name: env.name,
  version: env.version,
};

console.log("connector", {connector, env});
