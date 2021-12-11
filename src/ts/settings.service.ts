import { env } from "./_common";

export const setting_fields = ['scope', 'base_url'];

export interface ISettings {
  scope?: string;
  base_url?: string;
}

export class SettingsService {
  private readonly VISIBILITY = 'shared';

  private _cache: ISettings = {};
  get cache(): ISettings {
    return {...this._cache};  //clone
  }

  constructor() {
    this._cache = this.mergeSettings(env);
  }  

  get(t: any) {
    return t.get('board', this.VISIBILITY, env.SETTINGS_KEY, {})
      .then((result: any) => {
        if (result) {
          this._cache = this.mergeSettings(this._cache, result);
        }
        return this.cache;
      });
  }

  save(t: any, data: ISettings) {
    this._cache = this.mergeSettings(this._cache, data);
    return t.set('board', this.VISIBILITY, env.SETTINGS_KEY, data);
  }

  reset(t: any) {
    this._cache = this.mergeSettings(env);
    return t.remove('board', this.VISIBILITY, env.SETTINGS_KEY)
      .then(_ => {
        return this.cache;
      });
  }

  
  protected mergeSettings(...params: ISettings[]): ISettings {
    const ret = {};
    if (Array.isArray(params)) {
      params.forEach(param => {
        setting_fields.forEach(key => {
          if (param[key] !== undefined) {
            ret[key] = param[key];
          }
        });
      });
    }
    return ret;
  }


}
