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

    // console.log("copyToClipboard - 0");
    // element.contentEditable = true;
    // console.log("copyToClipboard - 1");
    // element.focus();
    // console.log("copyToClipboard - 2");
    // const range = document.createRange();
    // console.log("copyToClipboard - 3");
    // range.selectNodeContents(element);
    // console.log("copyToClipboard - 4");
    // const sel = window.getSelection();
    // console.log("copyToClipboard - 5");
    // sel.removeAllRanges();
    // console.log("copyToClipboard - 6");
    // sel.addRange(range);

    // console.log("DEBUG copyToClipboard", {element, range, sel});

    //*** CANNOT RUN COPY DUE TO PERMISSION ERROR ***/
    element.contentEditable = true;
    element.focus();
    document.execCommand('selectAll');
    document.execCommand('copy');
    // element.contentEditable = false;
    // getSelection().empty(); //clear
  }

  const itemToHtml = (ref: string, label: string, text: string | string[]) => {
    if (Array.isArray(text)) { 
      return `<h3 class="label">${label}</h3>`
        + '<div class="list">'
        + text.map(item => itemToHtml(ref, null, item)).join('')
        + '</div>'
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

    console.log("DEBUG: clipAndClose", {el, ref});

    if (ref) {
      const label = ref.querySelector(".label")?.innerHTML || 'card name';
      const text = ref.querySelector(".value");
      const message = `Added ${label} to the clipboard`;
      console.log("DEBUG: clipAndClose - working", {label, text, message});
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
  console.log("DEBUG: found the args", {data});

  //SUBTITLE
  document.getElementById('title').innerHTML = data.title;

  //content
  const content = document.getElementById('content');
  content.innerHTML = 
    '<section>'
    + data.content.map((c, index) => {
        return itemToHtml(`ref-${index}`, c.label, c.text);
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