import { ISettings, SettingsService } from "./settings.service";
import { toastr } from "./toastr.service";
import { env, trello } from "./_common";

export interface IAuthCred {
  id: string;
  username: string;
  token: string;
  expires?: number;
  isValid(member?: any): boolean;
}
export class AuthCred implements IAuthCred {
  id: string;
  username: string;
  token: string;
  expires: number;

  constructor(obj: any = null) {
    if (obj) {
      this.id = obj.id;
      this.username = obj.username;
      this.token = obj.token;
      this.expires = obj.expires;
    }
  }

  isValid(member?: any): boolean {
    if (this.id && this.username && this.token) {
      //check the member information (if provided)
      if (member && (this.id !== member.id || this.username !== member.username)) { return false; }

      //check expiration (if exists)
      if (typeof(this.expires) === 'number') {
        return Date.now() < this.expires;
      }
      //else (does not expire)
      return true;
    } 
    //else 
    return false;
  }
}
export interface IAuthResult {
  success: boolean;
  token?: string;
  resp?: any;
}


export class AuthService {
  private readonly storageKey = "hallpass-auth";
  private readonly authEndpoint = "https://trello.com";
  private readonly authVersion = "1";
  private deferred = {};

  settings: ISettings;

  constructor(t) {
    const service = new SettingsService();
    service.get(t)
      .then((result: ISettings) => {
        this.settings = result;
      })
  }

  getAuthCredentials(t, member: any = null): Promise<IAuthCred> {
    return this.getCredsFromStorage(t, member)
      .then(cred => {
        return cred?.isValid(member) ? cred : null
      });
  }

  authenticate(t, member: any): Promise<IAuthCred> {
     //todo: work on scope and expiration as params
     const authOpts = {
      name: env.name || "Hallpass App",
      scope: "read",
      expiration: '1hour'
    };
    return this.authPopup(authOpts)
      .then((result: IAuthResult) => { 
        const creds: IAuthCred = this.buildAuthCred(member, result.token);
        console.log("Back from authPopup", {result, creds});
        this.saveCredsToStorage(t, creds);
        return creds;
      })
      .catch(reason => { 
        console.log("Back from authPopup - ERROR", reason); 
        toastr.error(t, reason, 10 /* long delay */);
        return null;
      });
  }

  deAuthorize(t): Promise<boolean> {
    return this.saveCredsToStorage(t, null);
  }

  private buildAuthCred (member: any, token: string, expires: number = null): IAuthCred {
    return new AuthCred({
      id: member?.id,
      username: member?.username,
      token,
      expires
    });
  };

  private getCredsFromStorage (t: any, member: any): Promise<IAuthCred> {
    return t.get('member', 'private', this.storageKey)
      .then((result) => {
        return result?.id === member?.id ? new AuthCred(result) : this.buildAuthCred(member, null);
      });
  };

  private saveCredsToStorage(t: any, creds: IAuthCred): Promise<boolean> {
    return t.set('member', 'private', this.storageKey, creds)
      .then(_ => true);
  }

  private waitUntilLoaded(max_attempts: number = 5, delay: number = 300): Promise<boolean> {
    return new trello.Promise((resolve, reject) => {
      let count = 0;
      const retry = () => {
        count++;
        if (this.settings) { resolve(true); }
        if (count > max_attempts) { reject("Timeout"); }
        //else
        window.setTimeout(retry, delay); 
      }

      retry();
    });
  }

  private authUrl(params: any) {
    const query: string = Object.getOwnPropertyNames(params)
      .map((key: string) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      })
      .filter(Boolean).join('&');

    return `${this.authEndpoint}/${this.authVersion}/authorize?key=${this.settings.api_key}&${query}`;
  }

  private authPopup(opts: any): Promise<IAuthResult> {
    return new trello.Promise((resolve, reject) => {

      this.waitUntilLoaded()  //need to first get the settings
        .then (_ => {

        let token: string = null;

        const scope = opts.scope || "read";

        const { location } = window;

        const width = 720;
        const height = 800;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        const originMatch = new RegExp(`^[a-z]+://[^/]*`).exec(location?.origin);
        const origin = originMatch && originMatch[0];


        let authWindow = null;

        const receiveMessage = (event) => {
          if (
            event.origin !== this.authEndpoint ||
            event.source !== authWindow
          ) {
            return; //not our message
          }

          if (event.source != null) {
            event.source.close();
          }

          if (event.data != null && /[0-9a-f]{64}/.test(event.data)) {
            token = event.data;
          } else {
            token = null;
          }

          if (typeof(window.removeEventListener) === 'function') {
            window.removeEventListener('message', receiveMessage, false);
          }

          resolve({success: !!token, token, resp: event});

        };

         authWindow = window.open(
          this.authUrl({
            return_url: origin,
            callback_method: 'postMessage',
            scope,
            expiration: opts.expiration,
            name: opts.name,
          }),
          'trello',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!authWindow) {
          
          reject("Looks like Popup Windows have been blocked");

        } else {
          
          // Listen for messages from the auth window
          if (typeof(window.addEventListener) === 'function') {
            window.addEventListener('message', receiveMessage, false);
          }

        }



        
      })
      .catch(reason => {
        console.warn("Unable to authorize", {reason});
        reject(reason);
      });

    });
  }


}