import { AuthService } from "./auth.service";
import { env } from "./_common";

export namespace CardDetailBadges {
  

  export function auth(t: any) {

    return {
      title: env.name || "Hallpass Auth",
      text: "authenticate",
      color: "blue",
      callback: () => {
        const auth = new AuthService(t);
        auth.getToken(t)
          .then(result => {
            console.log("DEBUG: auth successful", result);
          })
          .catch(result => {
            console.log("DEBUG: auth failed", result);
          });
      }
    }
  }



  export function build(t: any) {
    return [
      auth(t)
    ].filter(Boolean);
  }
}