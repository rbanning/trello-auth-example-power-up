import { AuthService, IAuthCred } from "./auth.service";
import { toastr } from "./toastr.service";
import { env, trello } from "./_common";

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
            if (result?.isValid()) {
              toastr.success(t, "You have been authenticated");
            } else {
              toastr.warning(t, "Unable to authenticate you");
            }
          })
          .catch(result => {
            //ignore (handled by auth);
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
    return auth.getAuthCredentials(t, member)
      .then((creds: IAuthCred) => {
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