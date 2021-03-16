import { toastr } from "./toastr.service";
import { currentUserIsAdmin } from "./_common";

export namespace PowerUpSettings {

  

export const build = (t: any) => {
  return currentUserIsAdmin(t)
    .then((isAdmin: boolean) => {
      if (isAdmin) {
        return t.modal({
          title: 'Settings',
          url: './settings.html',
          fullscreen: false,
          accentColor: 'yellow',
          height: 300
        });  
      } else {
        toastr.warning(t, 'Sorry - only Admins can change the settings');
        return null;
      }    
    });
};

}
