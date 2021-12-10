import { ISettings, SettingsService } from "./settings.service";
import { StorageService } from "./storage.service";
import { ITimeModel, TimeModel } from "./time.model";
import { trello } from "./_common";

//prevent too many API calls
export const REQUEST_LIMIT = 10;
export const REQUEST_WINDOW = 10 * 60 * 1000; //milliseconds before new window opens
export const REQUEST_WATCHER = { start: 0, count: 0 };


export const STORAGE_KEY = "time";
export class TimeService {
  public readonly STORAGE_KEY = STORAGE_KEY;
  protected readonly URL_DELIM = '/';
  protected readonly CACHE_FOR = 60;  //cache the time for 60 minutes

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

  public getCardLocationTime(t: any = null) {
    t = t ?? this.t;
    const actions = [
      t.card('id', 'name', 'shortLink', 'coordinates', 'address', 'locationName'),
      this.storage.get<ITimeModel>(t, 'card', this.STORAGE_KEY)
    ];
    return trello.Promise.all(actions)
      .then(([card, storage]: [any, ITimeModel]) => {
        console.log("Card and Storage", {card, storage});
        if (card?.coordinates) {
          const {latitude, longitude} = card.coordinates;
          return this.fetchCurrentTimeFromApi(latitude, longitude);
        }
        //else
        return trello.Promise.resolve(null);
      });
  }


  
  public fetchCurrentTimeFromApi(latitude: number, longitude: number): Promise<ITimeModel> {
    return this.config
      .then((config: ISettings) => {
        if (!this.validateConfig(config)) {
          console.error("power-up needs to be configured");
          return trello.Promise.reject("not configured");
        }

        if (!this.OkToRunRequest()) {
          return trello.Promise.reject("api limit - throttling");
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
              this.storage.set(this.t, 'card', this.STORAGE_KEY, model, this.CACHE_FOR);
              resolve(model);
            })
            .catch(reject);
        });

        
      });
  }  

  //#endregion


  //#region >> REQUEST THROTTLING <<

  protected OkToRunRequest() {
    const now = Date.now();

    if (REQUEST_WATCHER.start + REQUEST_WINDOW >  now) {
      REQUEST_WATCHER.count++;
      return REQUEST_WATCHER.count <= REQUEST_LIMIT;
    } else {
      //reset watcher
      REQUEST_WATCHER.start = now;
      REQUEST_WATCHER.count = 1;
      return true;
    }

  }

  

  //#endregion


  //#region >> BASICS <<

  
  protected buildUrl(settingsOrBaseUrl: ISettings | string, ...params: string[]): string {
    let url = typeof(settingsOrBaseUrl) === 'string' ? settingsOrBaseUrl : settingsOrBaseUrl.base_url;
    if (!url.endsWith(this.URL_DELIM)) { url += this.URL_DELIM; }
    if (Array.isArray(params)) {
      url += params.join(this.URL_DELIM);
    }
    return url;
  }


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
