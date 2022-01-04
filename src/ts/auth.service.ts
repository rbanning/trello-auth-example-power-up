import { env, trello } from "./_common";

export interface IAuthResult {
  success: boolean;
  token?: string;
  resp?: any;
}

export class AuthService {


  getToken(): Promise<IAuthResult> {
    return new trello.Promise((resolve, reject) => {
      trello.authorize({
        type: "popup",
        name: env.name || "Hallpass App",
        persist: true,
        interactive: true,
        scope: {
          read: true,
          write: false,
          account: false
        },
        expires: '1hour',
        success: (param: any) => resolve({success: true, resp: param}),
        error: (param: any) => reject({success: false, resp: param})
      });
    });
  }

  
}