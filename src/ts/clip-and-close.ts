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

  const copyToClipboard = (element) => {
    element.contentEditable = true;
    element.focus();
    document.execCommand('selectAll');
    document.execCommand('copy');
    element.contentEditable = false;
    getSelection().empty(); //clear
  }

  const itemToHtml = (ref: string, label: string, text: string | string[]) => {
    if (Array.isArray(text)) { 
      return `<h3 class="label">${label}</h3>`
        + '<div class="list">'
        + text.map(item => itemToHtml(ref, null, item)).join('')
        + '</div>'
    }
    //else
    return '<div class="item">'
      + (!!label ? `<label>${label} </label>` : '')
      + `<span class="value" id="${ref}">${text}</span>`
      + `<button class="copy" ref="${ref}" ><img src="./add-to-clipboard.png" alt="icon of clipboard"/></button>`
      + '</div>';
  }


  const clipAndClose = (e) => {
    console.log("clipAndClose", e);
    
    // if (text) {
    //   message = message || 'Added the text to the clipboard';
    //   try {
    //     navigator.clipboard.writeText(text)
    //       .then(() => {
    //         t.closePopup();
    //         t.alert({
    //           message              
    //         });            
    //       });
    //   } catch (error) {
    //     console.warn("Unable to add text to the clipboard", error);
    //     t.alert({
    //       message: 'Error trying to add text to the clipboard',
    //       display: 'error'
    //     });
    //   }
    // } else {
    //   t.closePopup();
    // }
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
      document.getElementById('subtitle').innerHTML = data.title;

      //content
      const content = document.getElementById('content');
      content.innerHTML = 
        '<section style="margin: 1em 0">'
        + data.content.map((c, index) => {
            return itemToHtml(`ref-${index}`, c.label, c.text);
          }).join('')
        + '</section>';

      //clip
      content.querySelectorAll('.copy').forEach(item => {
        item.addEventListener('click', clipAndClose);
      });


      loading.hide();
      return t.sizeTo('#page');

});