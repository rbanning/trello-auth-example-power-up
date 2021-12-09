import { ISettings, SettingsService } from "./settings.service";
import { trello } from "./_common";



export class TimeService {
  protected readonly URL_DELIM = '/';
    
  //cache the settings information needed to create requests
  private _config: Promise<ISettings>;
  public get config() { return this._config; }

  constructor(t: any = null) { 
    const settingsService = new SettingsService();
    t = t || trello.t();    
    this._config = settingsService.get(t);
  }


  //#region >> Current Time based on location <<

  public fetchCurrentTime(lat: number, long: number) {
    return this.config
      .then((config: ISettings) => {
        const url = this.buildUrl(config, "TimeZone", "coordinate")
          + `?latitude=${lat}&longitude=${long}`;

        const options: any = { 
          method: "GET",
          headers: this.getHeaders()
        };

        return fetch(url, options)
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


  //#region >> BASIC HEADER <<

  protected getHeaders() {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    return headers;
  }

  //#endregion
}
