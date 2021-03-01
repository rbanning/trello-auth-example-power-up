import { LoadingService } from "./loading.service";
import { trello } from "./_common";

const t = trello.t();
const loading = new LoadingService();
loading.show();


t.render(() => {



  //HELPERS
  const close = () => {
    trello.t().closeModal();
    //trello.t().closePopup();
  };

  const copyToClipboard = (element: any) => {
    //reset
    var sel = getSelection();
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
  }

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
  }


  const clipAndClose = (el: HTMLElement) => {
    const ref = document.getElementById(el?.attributes['ref']?.value);
    const t = trello.t();


    if (ref) {
      const label = ref.querySelector(".label")?.innerHTML || 'item';
      const text = ref.querySelector(".value");
      const message = `Added ${label} to the clipboard`;

      try {
        copyToClipboard(text);
        close();
        t.alert({
          message              
        });            
      } catch (error) {
        console.warn("Unable to add text to the clipboard", {error, label, text, message});
        t.alert({
          message: 'Error trying to add text to the clipboard',
          display: 'error'
        });
      }
    } else {
      close();
    }
  }


  //SETUP CLOSE BUTTON
  window.document.querySelectorAll('.close')
  .forEach(btn => {
    btn.addEventListener('click', close);
  });

  //GET THE ARGS PASSED TO THE PAGE
  const data = t.arg('data');

  //SUBTITLE
  document.getElementById('title').innerHTML = data.title;

  //content
  const content = document.getElementById('content');
  content.innerHTML = 
    '<section>'
    + data.content.map((c, index) => {
        return itemToHtml(`ref-${index}`, c.label, c.text, c.group);
      }).join('')
    + '</section>';

  //clip
  content.querySelectorAll('.copy').forEach(item => {
    item.addEventListener('click', (e) => {
      clipAndClose(item as HTMLElement);
    });
  });


  loading.hide();
  return t.sizeTo('#wrapper');

});