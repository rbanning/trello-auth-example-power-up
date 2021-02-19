export interface ITrelloEnvironment {
  Promise: Promise<any>;
  t: () => any;
}
export const trello: ITrelloEnvironment = {
  Promise: (window as any).TrelloPowerUp.Promise,
  t:  () => { return (window as any).TrelloPowerUp.iframe(); }
};

export const env = {
  name: '%%NAME%%',
  scope: '%%SCOPE%%',
  scope_code: '%%SCOPE_CODE%%',
  base_url: '%%BASE_URL%%',
  platform: '%%PLATFORM%%',
  version: '%%VERSION%%',
};

