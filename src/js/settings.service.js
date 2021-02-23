import { env } from "./_common";
export const setting_fields = ['active_list_id', 'scope', 'scope_code', 'scope_secret', 'base_url'];
export class SettingsService {
    constructor() {
        this.VISIBILITY = 'shared';
        this._cache = {};
        this._cache = this.mergeSettings(env);
    }
    get cache() {
        return Object.assign({}, this._cache); //clone
    }
    get(t) {
        return t.get('board', this.VISIBILITY, env.SETTINGS_KEY, {})
            .then((result) => {
            if (result) {
                this._cache = this.mergeSettings(this._cache, result);
            }
            return this.cache;
        });
    }
    save(t, data) {
        this._cache = this.mergeSettings(this._cache, data);
        return t.set('board', this.VISIBILITY, env.SETTINGS_KEY, data);
    }
    reset(t) {
        this._cache = this.mergeSettings(env);
        return t.remove('board', this.VISIBILITY, env.SETTINGS_KEY)
            .then(_ => {
            return this.cache;
        });
    }
    //special get
    scope(t) {
        return this.get(t)
            .then((settings) => {
            return {
                id: settings.scope,
                code: settings.scope_code,
                secret: settings.scope_secret
            };
        });
    }
    mergeSettings(...params) {
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
//# sourceMappingURL=settings.service.js.map