import { AuthService, IAuthCred } from "./auth.service";
import { toastr } from "./toastr.service";
import { env, trello } from "./_common";

export namespace CardDetailBadges {
  
  const authenticateBadge = (member: any) => {
    return {
      title: env.name || "Hallpass Auth",
      text: "Please Authenticate",
      color: "gray",
      callback: (t) => {
        const auth = new AuthService(t);
        auth.authenticate(t, member)
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

  const accountBadge = (name) => {
    const close = (t) => {
      t.closePopup();
    };

    return {
      title: "Account",
      text: name,
      color: "blue",
      callback: (t) => {
        return t.popup({
          title: 'My Account',
          items: [{
            text: 'Profile',
            callback: (tt, opts) => { console.log("DEBUG: PROFILE", {opts}); close(tt); }
          }, {
            text: 'DeAuthorize',
            callback: (tt, opts) => { 
              const auth = new AuthService(tt);
              auth.deAuthorize(tt)
                .then(_ => toastr.success(tt, "You're account has been de-authorized"));
              close(tt); 
            }
          }]
        });
      }
    }
  }
  
  const authenticatedActions = (t: any, member: any) => {
    const auth = new AuthService(t);
    return auth.getAuthCredentials(t, member)
      .then((creds: IAuthCred) => {
        return (creds?.isValid() ? [accountBadge(member?.fullName), actionBadge()] : authenticateBadge(member));
      });
  }

  export class Button {
    size: 'sm' | 'med' | 'lg' = 'med';
    color: string = 'red';
    label: string = "Label";
  }

  export class Story<T> {
    component: { new(): T};
    props: T
  }

  export const build = (t: any) => {
    const Template = (args: Button): Story<Button> => ({
      component: Button,
      props: args
    });
    const Default = Template.bind({});
    const Primary = Template.bind({});
    Primary.args = {
      size: 'lg',
      label: 'Primary'
    };
    const Secondary = Template.bind({});
    Secondary.args = {
      color: 'blue',
      label: 'Secondary'
    }

    console.log("DEBUG: Story Template", {Template, Default, Primary, Secondary});

    

    return t.member('id', 'username', 'fullName')
      .then(member => {
        return authenticatedActions(t, member)
          .then(results => {
            return results;
          });
      });
  }
}