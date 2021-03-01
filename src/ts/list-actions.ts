export namespace ListActions {

  const listDetails = (t) => {
    return t.list('all')
      .then(list => {
        const content = [
          { label: 'list id', text: list.id },
          { label: 'list name', text: list.name },
          { group: 'card name(s)' },
          list.cards.map(c => { return { text: `<a href="${c.url}" target="_blank">${c.name}</a>` }; })
        ].flat();
        const data = {
          title: 'List Details',
          content
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