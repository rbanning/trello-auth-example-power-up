export namespace ListActions {

  const listDetails = (t) => {
    return t.list('all')
      .then(list => {
        const data = {
          title: 'List Details',
          content: [
            { label: 'list id', text: list.id },
            { label: 'list name', text: list.name },
            { label: 'card name(s)', text: list.cards.map(c => `<a href="${c.url}" target="_blank">${c.name}</a>`) }
          ]
        };
        return t.popup({
          title: 'List Details',
          url: './clip-and-close.html',
          args: { data },
          height: 200
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