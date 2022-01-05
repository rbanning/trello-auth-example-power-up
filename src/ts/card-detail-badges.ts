import { AuthService, IAuthCred } from "./auth.service";
import { env } from "./_common";

export namespace CardDetailBadges {
  
  const authenticateBadge = () => {
    return {
      title: env.name || "Hallpass Auth",
      text: "Please Authenticate",
      color: "gray",
      callback: (t) => {
        const auth = new AuthService(t);
        auth.getAuthCredentials(t)
          .then(result => {
            console.log(`DEBUG: auth ${result?.isValid() ? "successful" : "failed"}`, result);
          })
          .catch(result => {
            console.log("DEBUG: auth rejected", result);
          });
      }
    };
  }

  const actionBadge = () => {
    const close = (t) => {
      t.closePopup();
    };

    return {
      title: env.name || "Hallpass Auth",
      text: "Take Action",
      color: "blue",
      callback: (t) => {
        return t.popup({
          title: 'Snooze Card',
          items: [{
            text: 'In 15 Minutes',
            callback: (tt, opts) => { console.log("DEBUG: SNOOZE - 15 Minutes", {opts}); close(tt); }
          }, {
            text: 'In 1 hour',
            callback: (tt, opts) => { console.log("DEBUG: SNOOZE - 1 hour", {opts}); close(tt); }
          }, {
            text: 'In 2 hours',
            callback: (tt, opts) => { console.log("DEBUG: SNOOZE - 2 hours", {opts}); close(tt); }
          }]
        });
      }
    };

  }
  
  const authenticatedActions = (t: any) => {
    const auth = new AuthService(t);
    console.log("DEBUG: In authenticatedActions", {t, auth});
    return auth.getAuthCredentials(t)
      .then((creds: IAuthCred) => {
        console.log("DEBUG: about to make a decision", creds, creds?.isValid());
        return creds?.isValid() ? actionBadge() : authenticateBadge();
      });
  }



  export const build = (t: any) => {
    return [
      authenticatedActions(t)
    ].filter(Boolean);
  }
}