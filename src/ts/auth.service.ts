import { ISettings, SettingsService } from "./settings.service";
import { env, trello } from "./_common";

export interface IAuthResult {
  success: boolean;
  token?: string;
  resp?: any;
}

export class AuthService {
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

  getToken(): Promise<IAuthResult> {
    return new trello.Promise((resolve, reject) => {
      const authOpts = {
        name: env.name || "Hallpass App",
        scope: {
          read: true,
          write: false,
          account: false
        },
        expires: '1hour',
        success: (param: any) => resolve({success: true, resp: param}),
        error: (param: any) => reject({success: false, resp: param})
      };
      this.authPopup(authOpts);
    });
  }


  private waitUntil (name, fx) {
    if (!this.deferred[name]) {
      this.deferred[name] = [];
    }
    this.deferred[name].push(fx);
  };

  private isReady (name, value) {
    if (this.deferred[name]) {
      const fxs = this.deferred[name];
      delete this.deferred[name];
      for (const fx of fxs) {
        fx(value);
      }
    }
  };

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
        return `${encodeURI(key)}=${encodeURI(params[key])}`
      })
      .filter(Boolean).join('&');

    return `${this.authEndpoint}/${this.authVersion}/authorize?key=${this.settings.api_key}&${query}`;
  }

  private authPopup(opts: any) {
    this.waitUntilLoaded()
      .then (_ => {
      // waitUntil('authorized', (isAuthorized) => {
      //   if (isAuthorized) {
      //     persistToken();
      //     if (isFunction(authorizeOpts.success)) {
      //       authorizeOpts.success();
      //     }
      //     return;
      //   }
      //   if (isFunction(authorizeOpts.error)) {
      //     authorizeOpts.error();
      //   }
      // });

      let token: string = null;

      const scope = Object.keys(opts.scope || {})
        .reduce((accum, k) => {
          if (opts.scope[k]) {
            accum.push(k);
          }
          return accum;
        }, [])
        .join(',');

      const { location } = window;

      const width = 720;
      const height = 800;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const originMatch = new RegExp(`^[a-z]+://[^/]*`).exec(location?.origin);
      const origin = originMatch && originMatch[0];
      const authWindow = window.open(
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

      const receiveMessage = function (event) {
        console.log("DEBUG: receiveMessage", {event});

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
      };

      // Listen for messages from the auth window
      if (typeof(window.addEventListener) === 'function') {
        window.addEventListener('message', receiveMessage, false);
      }
    })
    .catch(reason => {
      console.warn("Unable to authorize", {reason});
    });
  }

}