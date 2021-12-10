import { ISettings, SettingsService } from "./settings.service";
import { StorageService } from "./storage.service";
import { ITimeModel, TimeModel } from "./time.model";
import { trello } from "./_common";


export const STORAGE_KEY = "time";
export class TimeService {
  public readonly STORAGE_KEY = STORAGE_KEY;
  protected readonly URL_DELIM = '/';
    
  //cache the settings information needed to create requests
  private _config: Promise<ISettings>;
  public get config() { return this._config; }

  private storage: StorageService;

  constructor(private t: any = null) { 
    const settingsService = new SettingsService();
    t = t || trello.t();    
    this._config = settingsService.get(t);
    this.storage = new StorageService();
  }


  //#region >> Current Time based on location <<
  public getCurrentTime(latitude: number, longitude: number): Promise<ITimeModel> {
    const actions = [
      this.storage.get<ITimeModel>(this.t, 'card', this.STORAGE_KEY),
      this.fetchCurrentTimeFromApi(latitude, longitude)
    ];

    return trello.Promise.all(actions)
      .then(([storage, timeModel]: [ITimeModel, ITimeModel]) => {
        console.log("ACTIONS COMPLETE", {storage, timeModel});
        return timeModel;
      });

    // return new trello.Promise((resolve, reject) => {
    //   this.storage.get<ITimeModel>(this.t, 'card', this.STORAGE_KEY)
    //     .then(result => {
    //       if (result?.coordinate?.latitude === latitude && result?.coordinate?.longitude === longitude) {
    //         resolve(result);
    //       } else {
    //         this.fetchCurrentTimeFromApi(latitude, longitude)
    //           .then(model => {
    //             resolve(model);
    //           });
    //       }  
    //     });
    // });
  }

  public fetchCurrentTimeFromApi(latitude: number, longitude: number): Promise<ITimeModel> {
    return this.config
      .then((config: ISettings) => {
        if (!this.validateConfig(config)) {
          console.error("power-up needs to be configured");
          return null;
        }

        return new trello.Promise((resolve, reject) => {
          //note new url
          const url = this.buildUrl(config, "world-time", "coordinate")
          + `?latitude=${latitude}&longitude=${longitude}`;

          const options: any = { 
          method: "GET",
          headers: this.getHeaders(config)
          };

          fetch(url, options)
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
              var model = new TimeModel({
                ...resp,
                coordinate: { latitude, longitude}
              });
              console.log("BACK FROM API", {resp, model});
              this.storage.set(this.t, 'card', this.STORAGE_KEY, model);
              resolve(model);
            })
            .catch(reject);
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
