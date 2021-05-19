import { LoadingService } from "./loading.service";
import { trello } from "./_common";

const t = trello.t();
const loading = new LoadingService();
loading.show();


t.render(() => {



  //HELPERS
  const close = () => {
    //trello.t().closeModal();
    trello.t().closePopup();
  };

  const copyToClipboard = (element: any) => {
    //reset
    const sel = getSelection();
    if (sel) { sel.empty(); }

    //highlight
    element.contentEditable = true;
    element.focus();
    document.execCommand('selectAll');
    document.execCommand('copy');
    return window.setTimeout(() => {
      element.contentEditable = false;
      //getSelection().empty(); //clear
    }, 1000);
  };

  const itemToHtml = (ref: string, label: string, text: string, group: string) => {
    if (!text) { 
      return !!group ? `<h3 class="label">${group}</h3>` : '';
    }

    //else
    return `<div class="item" id="${ref}">`
      + `<button class="copy" ref="${ref}" title="copy to clipboard" data-label="${label || ''}">` 
      + `<img src="./clip-and-close.png" alt="icon of dot"/>`
      + `</button>`
      + '<span class="area">'
      + (!!label ? `<span class="label">${label} </span>` : '')
      + `<span class="value">${text}</span>`
      + '</span>'
      + '</div>';
  };


  const clipAndGo = (el: HTMLElement) => {
    // tslint:disable-next-line: no-string-literal
    const ref = document.getElementById(el?.attributes['ref']?.value);
    const tt = trello.t();

    if (ref) {
      const label = ref.querySelector(".label")?.innerHTML || 'item';
      const text = ref.querySelector(".value");
      const message = `Added ${label} to the clipboard`;

      try {
        copyToClipboard(text);
        tt.alert({
          message              
        });            
      } catch (error) {
        console.warn("Unable to add text to the clipboard", {error, label, text, message});
        tt.alert({
          message: 'Error trying to add text to the clipboard',
          display: 'error'
        });
      }
    }
  };

  const setupPage = (): Promise<any> => {
    return new trello.Promise((resolve, reject) => {

      //SETUP CLOSE BUTTON
      window.document.querySelectorAll('.close')
      .forEach(btn => {
        btn.addEventListener('click', close);
      });

      //GET THE ARGS PASSED TO THE PAGE
      const data = t.arg('data');
      if (!data) { reject("Could not get the data!"); }

      //SUBTITLE
      document.getElementById('title').innerHTML = data.title;
      
      //content
      const content = document.getElementById('content');
      if (!content) { reject("Could not find the content element"); }
      content.innerHTML = 
        '<section>'
        + data.content.map((c, index) => {
            return itemToHtml(`ref-${index}`, c.label, c.text, c.group);
          }).join('')
        + '</section>';

      //setup clipAndGo actions
      content.querySelectorAll('.copy').forEach(item => {
        item.addEventListener('click', (e) => {
          clipAndGo(item as HTMLElement);
        });
      });

      resolve(true);
    });
  }; //end setupPage


  setupPage()
    .then(() => {
      loading.hide();
      return t.sizeTo('#wrapper');      
    });

});
