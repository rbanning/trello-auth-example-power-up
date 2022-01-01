export namespace Context {

  export type Permission = "write" | "read";
  export interface IContextPermission {
    board: Permission;
    organization: Permission;
    card: Permission;
  }

  export interface IContext {
    //each of the following represent IDs of entity listed
    board: string;
    list: string;
    card: string;
    member: string;
    organization: string;
    enterprise: string;
    command: string;

    permissions: IContextPermission;
    version: string;
  }


  export const getContext = (t: any): IContext => {
    return t.getContext() as IContext;
  }
}