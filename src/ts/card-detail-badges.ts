import { AuthService, IAuthCred } from "./auth.service";
import { env, trello } from "./_common";

export namespace CardDetailBadges {
  
  const authenticateBadge = () => {
    console.log("DEBUG: authenticateBadge");
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
  
  const authenticatedActions = (t: any, member: any) => {
    const auth = new AuthService(t);
    console.log("DEBUG: In authenticatedActions", {t, auth, member});
    return auth.getAuthCredentials(t, member)
      .then((creds: IAuthCred) => {
        console.log("DEBUG: about to make a decision", creds, creds?.isValid());
        return (creds?.isValid() ? actionBadge() : authenticateBadge());
      });
  }



  export const build = (t: any) => {
    return t.member('id', 'username')
      .then(member => {
        return authenticatedActions(t, member)
          .then(result => {
            return [result];
          });
      });
  }
}