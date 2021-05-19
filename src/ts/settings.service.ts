import { DynamicIdentity } from "./dynamic-identity";
import { env } from "./_common";

export const setting_fields = ['config_id', 'scope', 'scope_code', 'scope_secret', 'base_url'];

export interface ISettings {
  config_id?: string;
  scope?: string;
  scope_code?: string;
  scope_secret?: string;
  base_url?: string;
}


export const card_setting_fields = ['simple_data_id'];
export interface ICardSettings {
  simple_data_id?: string;
}
export const defaultCardSettings: ICardSettings = {
  simple_data_id: null
};

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

  getCardSettings(t: any): ICardSettings {
    return t.get('card', this.VISIBILITY, env.SETTINGS_KEY, {})
      .then((result: any) => {
        return this.mergeCardSettings(defaultCardSettings, result);
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

  //special get
  scope(t: any) {
    return this.get(t)
      .then((settings: ISettings) => {
        return {
          id: settings.scope,
          code: settings.scope_code,
          secret: settings.scope_secret
        } as DynamicIdentity.IDynamicIdentityScope;
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

  protected mergeCardSettings(...params: ICardSettings[]): ICardSettings {
    const ret = {};
    if (Array.isArray(params)) {
      params.forEach(param => {
        if (param) {
          card_setting_fields.forEach(key => {
            if (param[key] !== undefined) {
              ret[key] = param[key];
            }
          });  
        }
      });
    }
    return ret;
  }

}
