import { DynamicIdentity } from "./dynamic-identity";
import { SettingsService } from "./settings.service";
import { trello } from "./_common";
export class FetchBaseService {
    constructor(t = null) {
        this.settingsService = new SettingsService();
        if (t) {
            const actions = [
                this.settingsService.get(t),
                t.member('id', 'username', 'fullName')
            ];
            this._config = trello.Promise.all(actions)
                .then(([settings, member]) => {
                this.settings = settings;
                this.member = member;
                return { settings, member };
            });
        }
    }
    getSettingsAndMember() {
        return this._config
            .then(result => {
            return result;
        });
    }
    //#region >> FETCH HELPERS <<
    _fetch(url, method, headers, data) {
        method = !method ? 'GET' : method.toLocaleUpperCase();
        const options = {
            method,
            headers
        };
        if (data) {
            headers.append('Content-Type', 'application/json');
            options.body = JSON.stringify(data);
        }
        return fetch(url, options)
            .then((resp) => {
            if (resp.ok) {
                const json = resp.json();
                return json;
            }
            //else
            console.warn(`HTTP ERROR - ${resp.status} (${resp.statusText})`, resp);
            throw new Error("Unable to complete request");
        });
    }
    fetchUsingT(url, method, t, data) {
        return this.getHeaders(t)
            .then((headers) => {
            return this._fetch(url, method, headers, data);
        });
    }
    fetchUsingSettingsAndMember(url, method, settings, member, data) {
        return this.fetchUsingScope(url, method, DynamicIdentity.buildScopeFromSettings(settings), member.username, data);
    }
    fetchUsingScope(url, method, scope, user, data) {
        const headers = DynamicIdentity.getHeaders(scope, user);
        return this._fetch(url, method, headers, data);
    }
    buildUrl(settingsOrBaseUrl, ...params) {
        const delim = '/';
        let url = typeof (settingsOrBaseUrl) === 'string' ? settingsOrBaseUrl : settingsOrBaseUrl.base_url;
        if (!url.endsWith(delim)) {
            url += delim;
        }
        if (Array.isArray(params)) {
            url += params.join(delim);
        }
        return url;
    }
    //#endregion
    //#region >> DYNAMIC IDENTITY <<
    getHeaders(t) {
        const actions = [
            this.settingsService.get(t),
            t.member('id', 'username', 'fullName')
        ];
        return trello.Promise.all(actions)
            .then(([settings, member]) => {
            return DynamicIdentity.getHeaders(DynamicIdentity.buildScopeFromSettings(settings), member.username);
        });
    }
}
//# sourceMappingURL=fetch.base-service.js.map