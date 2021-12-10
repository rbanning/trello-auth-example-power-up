
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
        return defaultValue;  //todo: this is just for testing.
      });
  }

  set(t: any, scope: StorageScope, key: string, value: any): Promise<any> {
    return t.set(scope, this.visibility, key, value);
  }
}