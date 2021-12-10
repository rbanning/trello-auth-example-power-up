import { trello } from "./_common";

export interface IStorageService {
  get: (key: string, defaultValue: any) => any;
  set: (key: string, value: any, expiresIn: number) => void;
}
export interface IStore {
  getItem: (key: string) => any;
  setItem: (key: string) => void;
}

export interface IStorageItem {
  _v: any;
  exp?: number //timestamp
}

export class StorageService implements IStorageService {

  constructor(private store: Storage = window.localStorage) {}

  get<T>(key: string, defaultValue: T = null): Promise<T> {
    let result = defaultValue;
    const json = this.store.getItem(key);
    if (json) {
      const data = JSON.parse(json);
      if (data && "_v" in data) {
        if (!data.exp || Date.now() < data.exp) {
          result = data._v;
        }
      }
    }

    //done
    return trello.Promise.resolve(result);
  }

  set(key: string, value: any, expiresIn: number = 0 /* minutes */): Promise<IStorageItem> {
    //wrap the value in IStorageItem
    const item: IStorageItem = {
      _v: value
    }
    if (expiresIn !== 0) {
      item.exp = Date.now() + (expiresIn * 60 * 1000) //convert to milliseconds
    }
    this.store.setItem(key, JSON.stringify(item));
    console.log("Set storage item", {key, value, item});
    return trello.Promise.resolve(item);
  }
}