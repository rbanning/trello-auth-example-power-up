import { trello } from "./_common";

export type StorageScope = 'board' | 'card' | 'member' | 'organization';
export type StorageVisibility = 'shared' | 'private'
export interface IStorageItem {
  _v: any;
  exp?: number //timestamp
}

export class StorageService {

  constructor(public visibility: StorageVisibility = 'shared') {}

  get<T>(t: any, scope: StorageScope, key: string, defaultValue: T = null): Promise<T> {
    return t.get(scope, this.visibility, key)
      .then((data: any) => {
        console.log("Storage", {scope, key, data});
        if ("_v" in data) {
          if (!data.exp || data.exp > Date.now()) {
            return data._v;
          }
        }
        //else
        return defaultValue;
      });
  }

  set(t: any, scope: StorageScope, key: string, value: any, expiresIn: number = 0 /* minutes */): Promise<any> {
    //wrap the value in IStorageItem
    const item: IStorageItem = {
      _v: value
    }
    if (expiresIn !== 0) {
      item.exp = Date.now() + (expiresIn * 60 * 1000) //convert to milliseconds
    }
    console.log("About to set storage item", {value, item});
    return t.set(scope, this.visibility, key, item);
  }
}