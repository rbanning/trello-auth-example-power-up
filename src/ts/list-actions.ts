export namespace ListActions {

  const clipAndClose = (t, text, message) => {
    if (text) {
      message = message || 'Added the text to the clipboard';
      try {
        navigator.clipboard.writeText(text)
          .then(() => {
            t.closePopup();
            t.alert({
              message              
            });            
          });
      } catch (error) {
        console.warn("Unable to add text to the clipboard", error);
        t.alert({
          message: 'Error trying to add text to the clipboard',
          display: 'error'
        });
      }
    } else {
      t.closePopup();
    }
  }

  const listDetails = (t) => {
    return t.list('all')
      .then(list => {
        return t.popup({
          title: 'List Details',
          items: [
            {
              text: `ID: ${list.id}`,
              callback: (x) => {
                clipAndClose(x, list.id, 'Put list id into the clipboard');
              }
            },
            {
              text: `Name: ${list.name}`,
              callback: (x) => {
                clipAndClose(x, list.id, 'Put list name into the clipboard');
              }
            },
            {
              text: `Cards: ${list.cards?.length || 'n/a'}`,
              callback: (x) => {
                const cards = list.cards.map(c => c.name).join('/n');
                clipAndClose(x, list.id, 'Put card names in the list into the clipboard');
              }
            }
          ]
        });
      });
  }

  export const build = (t) => {
    if (navigator.clipboard) {
      return [{
        text: 'List Details',
        callback: listDetails
      }];
    }
    //else
    return [];
  }
}