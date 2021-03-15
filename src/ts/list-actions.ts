import { AboutPage } from "./about-page";

export namespace ListActions {

  export const build = (t) => {
    if (navigator.clipboard) {
      return [{
        text: 'List Details',
        callback: AboutPage.showAboutList
      }];
    }
    //else
    return [];
  };

}
