import { ISettings, SettingsService } from "./settings.service";
import { toastr } from "./toastr.service";
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

  getToken(t): Promise<IAuthResult> {
    return new trello.Promise((resolve, reject) => {
      const authOpts = {
        name: env.name || "Hallpass App",
        scope: "read",
        expiration: '1hour',
        // success: (param: any) => resolve({success: true, resp: param}),
        // error: (param: any) => reject({success: false, resp: param})
      };
      this.authPopup(authOpts)
        .then(result => { console.log("Back from authPopup", result); })
        .catch(reason => { 
          console.log("Back from authPopup - ERROR", reason); 
          toastr.error(t, reason);
        });
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
        return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      })
      .filter(Boolean).join('&');

    return `${this.authEndpoint}/${this.authVersion}/authorize?key=${this.settings.api_key}&${query}`;
  }

  private authPopup(opts: any): Promise<IAuthResult> {
    return new trello.Promise((resolve, reject) => {

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
          console.log("DEBUG: receiveMessage", {event, endpoint: this.authEndpoint, check: event.source !== authWindow});

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


  private authorize(t: any, opts: any) {

    this.waitUntilLoaded()
      .then(_ => {

        console.log("DEBUG: authorize ready", this.settings);

        //SETUP OPTS
        opts = opts || {};
        opts.callback_method = "fragment";
        opts.return_url = window.location.origin;  ///return to this page
        opts.response_type = "token";
        opts.expiration = opts.expiration || "1hour";
        opts.scope = opts.scope || "read";

        const oauthUrl = this.authUrl(opts);

        const tokenLooksValid = function(token) {
          console.log("DEBUG: tokenLooksValid", token, /^[0-9a-f]{64}$/.test(token));
          return /^[0-9a-f]{64}$/.test(token);
        }


        const authorizeOpts = {
          height: 680,
          width: 580,
          validToken: tokenLooksValid,
          windowCallback: function(authorizeWindow) {
            // This callback gets called with the handle to the
            // authorization window. This can be useful if you
            // can't call window.close() in your new window
            // (such as the case when your authorization page
            // is rendered inside an iframe).
            console.log("DEBUG: windowCallback", {authorizeWindow});
            const storageHandler = (evt) => {
              console.log("DEBUG: storageHandler", {evt});
              if (evt.key === 'token' && evt.newValue) {
                // Do something with the token here, then...
                authorizeWindow?.close();
                window.removeEventListener('storage', storageHandler);
              }
            };
            window.addEventListener('storage', storageHandler);
          }
        };

        //run!!
        console.log("Running authorize", {oauthUrl, authorizeOpts, opts});
        t.authorize(oauthUrl, authorizeOpts)
        .then(function(token) {
          console.log("DEBUG: GOT TOKEN", {token});
          return t.set('organization', 'private', 'token', token)
          .catch(t.NotHandled, function() {
            // fall back to storing at board level
            return t.set('board', 'private', 'token', token);
          });
        })
        .then(function() {
          // now that the token is stored, we can close this popup
          // you might alternatively choose to open a new popup
          return t.closePopup();
        })
        .catch(reason => {
          console.warn("Error authorizing", {reason});
        });

      })
      .catch(reason => {
        console.warn("Unable to authorize! - cannot read settings", {reason});
      }) //end waitUntilLoaded

  }

}