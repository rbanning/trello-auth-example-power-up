import { DynamicIdentity } from "./dynamic-identity";
import { ISettings, SettingsService, setting_fields } from "./settings.service";
import { trello } from "./_common";


export interface IFetchConfig {
  settings: ISettings;
  member: any;
}
export class FetchBaseService {
  protected readonly URL_DELIM = '/';
  
  protected settingsService: SettingsService;
  
  //cache the settings and member information needed to create the Dynamic Identity header
  private _config: Promise<IFetchConfig>;
  protected get config() { return this._config; }

  constructor(t: any) { 
    this.settingsService = new SettingsService();
    t = t || trello.t();
    const actions = [
      this.settingsService.get(t),
      t.member('id', 'username', 'fullName')
    ];
    this._config = trello.Promise.all(actions)
      .then(([settings, member]: [ISettings, any]) => {
        return { settings, member };
      });
  }

  protected getSettingsAndMember() {
    return this._config
      .then(result => {
        return result;
      });
  }

  //#region >> FETCH HELPERS <<

  protected runFetch(relativeUrl: string | string[], method: string, data?: any) {
    method = !method ? 'GET' : method.toLocaleUpperCase();

    return this.config
      .then((config: IFetchConfig) => {
        const headers = this.getHeaders(config.settings, config.member);
        const options: any = { 
          method,
          headers
        };
        if (data) {
          headers.append('Content-Type', 'application/json');
          options.body = JSON.stringify(data);
        }

        relativeUrl = Array.isArray(relativeUrl) ? relativeUrl.join(this.URL_DELIM) : relativeUrl;
        return fetch(this.buildUrl(config.settings, relativeUrl), options)
        .then((resp: Response) => {
          if (resp.ok) {
            const json = resp.json();
            return json;
          }
          //else
          console.warn(`HTTP ERROR - ${resp.status} (${resp.statusText})`, resp);
          throw new Error("Unable to complete request");
        });
  
      });
  }  

  protected buildUrl(settingsOrBaseUrl: ISettings | string, ...params: string[]): string {
    let url = typeof(settingsOrBaseUrl) === 'string' ? settingsOrBaseUrl : settingsOrBaseUrl.base_url;
    if (!url.endsWith(this.URL_DELIM)) { url += this.URL_DELIM; }
    if (Array.isArray(params)) {
      url += params.join(this.URL_DELIM);
    }
    return url;
  }

  //#endregion


  //#region >> DYNAMIC IDENTITY <<

  protected getHeaders(settings: ISettings, member: any) {
    return DynamicIdentity.getHeaders(DynamicIdentity.buildScopeFromSettings(settings), member.username);
  }

  //#endregion
}
