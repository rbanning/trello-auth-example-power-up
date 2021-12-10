import { ISettings, SettingsService } from "./settings.service";
import { ITimeModel, TimeModel } from "./time.model";
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

  public fetchCurrentTime(latitude: number, longitude: number): Promise<ITimeModel> {
    return this.config
      .then((config: ISettings) => {
        if (!this.validateConfig(config)) {
          console.error("power-up needs to be configured");
          return null;
        }


        //note new url
        const url = this.buildUrl(config, "world-time", "coordinate")
          + `?latitude=${latitude}&longitude=${longitude}`;

        const options: any = { 
          method: "GET",
          headers: this.getHeaders(config)
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
        })
        .then((resp: any) => {
          return new TimeModel({
            ...resp,
            coordinate: { latitude, longitude}
          });
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


  //#region >> BASICS <<

  protected validateConfig(config: ISettings) {
    return !!config.scope && !!config.base_url && config.scope.split("-").length === 5;
  }

  protected getHeaders(config: ISettings) {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("x-hallpass-api", config.scope);
    return headers;
  }

  //#endregion
}
