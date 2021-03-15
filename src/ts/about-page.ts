import { env } from "./_common";

export namespace AboutPage {

  export const showAboutBoard = (t) => {

    t.modal({
      url: './about-page-board.html',
      fullscreen: false,
      title: 'About Board',
      accentColor: env.accentColor,
      height: 500
    });
    
  };

  export const showAboutList = (t) => {

    t.modal({
      url: './about-page-list.html',
      fullscreen: false,
      title: 'About List',
      accentColor: env.accentColor,
      height: 500
    });
    
  };

}
