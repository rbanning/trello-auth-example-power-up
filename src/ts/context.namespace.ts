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
    card: string;
    command: string;
    member: string;
    organization: string;
    enterprise: string;

    permissions: IContextPermission;
  }


  export const getContext = (t: any): IContext => {
    return t.getContext() as IContext;
  }
}