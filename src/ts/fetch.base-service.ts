import { DynamicIdentity } from "./dynamic-identity";
import { ISettings, SettingsService, setting_fields } from "./settings.service";
import { trello } from "./_common";

export class FetchBaseService {
  protected settings: SettingsService;

  constructor() { 
    this.settings = new SettingsService();
  }

  protected _fetch(url: string, method: string, headers: Headers, data?: any) {
    method = !method ? 'GET' : method.toLocaleUpperCase();
    const options: any = { 
      method,
      headers
    };
    if (data) {
      headers.append('Content-Type', 'application/json');
      options.body = JSON.stringify(data);
    }
    return fetch(url, options)
      .then((resp: Response) => {
        if (resp.ok) {
          const json = resp.json();
          console.log("DEBUG: - _fetch", {url, method, options, data, resp, result: json});
          return json;
        }
        //else
        console.warn(`HTTP ERROR - ${resp.status} (${resp.statusText})`, resp);
        throw new Error("Unable to complete request");
      });
  }

  protected fetchUsingT(url: string, method: string, t: any, data?: any) {
    return this.getHeaders(t)
      .then((headers: Headers) => {        
        return this._fetch(url, method, headers, data);
      });
  }
  protected fetchUsingSettingsAndMember(url: string, method: string, scope: DynamicIdentity.IDynamicIdentityScope, user: string, data?: any) {
    const headers: Headers = DynamicIdentity.getHeaders(scope, user);
    return this._fetch(url, method, headers, data);
  }
  protected fetchUsingScope(url: string, method: string, scope: DynamicIdentity.IDynamicIdentityScope, user: string, data?: any) {
    const headers: Headers = DynamicIdentity.getHeaders(scope, user);
    return this._fetch(url, method, headers, data);
  }


  protected buildUrl(settingsOrBaseUrl: ISettings | string, ...params: string[]): string {
    const delim = '/';
    let url = typeof(settingsOrBaseUrl) === 'string' ? settingsOrBaseUrl : settingsOrBaseUrl.base_url;
    if (!url.endsWith(delim)) { url += delim }
    if (Array.isArray(params)) {
      url += params.join(delim);
    }
    return url;
  }

  protected getHeaders(t: any) {
    const actions = [
      this.settings.get(t),
      t.member('id', 'username', 'fullName')
    ];
    return trello.Promise.all(actions)
      .then(([settings, member]: [ISettings, any]) => {
        return DynamicIdentity.getHeaders(DynamicIdentity.buildScopeFromSettings(settings), member.username);
      })
  }
}