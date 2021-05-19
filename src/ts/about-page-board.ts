import { DateHelper } from "./date-helper";
import { LoadingService } from "./loading.service";
import { MemberComponent } from "./member.component";
import { trello } from "./_common";

const t = trello.t();
const loading = new LoadingService();
loading.show();


t.render(() => {



  //HELPERS
  const close = () => {
    trello.t().closeModal();
  };

  const memberHtml = (member: any) => {
    const el = MemberComponent.build(member);
    return el?.outerHTML;
  };

  const listHtml = (list: any) => {
    if (!list) { return null; }
    return `${list.name} <code style="margin: 0 1em;">(id: ${list.id})</code>`;
  };

  const customFieldHtml = (cf: any) => {
    if (!cf) { return null; }
    const cfOptions = (opt: any) => `- ${opt.value?.text} <code>${opt.id}</code>`;
    return `<span class="dark">${cf.name}</span> <br/><code style="margin: 0 1em;">(type: ${cf.type}, id: ${cf.id})</code>`
      + (cf.option ? cf.options.map(cfOptions) : '');
  };

  const dateHtml = (d: string) => {
    return `<span class="date">${!!d ? DateHelper.dateMedium(new Date(d)) : 'none'}</span>`;
  };

  //SETUP CLOSE BUTTON
  window.document.querySelectorAll('.close')
    .forEach(btn => {
      btn.addEventListener('click', close);
    });

  
  //GET ALL OF THE INFORMATION
  const actions = [
    t.board('id', 'name', 'shortLink', 'url', 'dateLastActivity', 'members', 'memberships', 'customFields'), //all about the board
    t.lists('id', 'name')
  ];
  trello.Promise.all(actions)
    .then(([board, lists]: [any, any[]] ) => {
      
      console.log("DEBUG: Actions results", {board, lists});

      //subtitle
      const subtitle = window.document.getElementById('subtitle');
      subtitle.innerHTML = board.name;

      //get content element
      const content = window.document.getElementById('content');

      //members
      const members = window.document.createElement('section');
      members.innerHTML = '<h3>Members</h3>'
        + (board.members.length === 0 ? '<p><strong>None</strong></p>' : `${board.members.map(memberHtml).join(' ')}`);

      //lists
      const listSection = window.document.createElement('section');
      listSection.innerHTML = '<h3>Lists</h3>'
        + ((!lists || lists.length === 0) ? '<p><strong>None</strong><p>'
        : `<ul><li>${lists.map(listHtml).join('</li><li>')}</li></ul>`);

      //custom fields
      const cfSection = window.document.createElement('section');
      cfSection.innerHTML = '<h3>Custom Fields</h3>'
        + ((!board.customFields || board.customFields.length === 0) ? '<p><strong>None</strong><p>'
        : `<ul><li>${board.customFields.map(customFieldHtml).join('</li><li>')}</li></ul>`);

      //meta
      const meta = window.document.createElement('section');
      meta.innerHTML = '<h3>Meta Information</h3>'
        + `<div><strong>Id:</strong> ${board.id}</div>`
        + `<div><strong>Short Id:</strong> <a href="https://trello.com/b/${board.shortLink}">${board.shortLink}</a></div>`
        + `<div><strong>Url:</strong> <a href="${board.url}">${board.url}</a></div>`
        + `<div><strong>Last Activity:</strong> ${dateHtml(board.dateLastActivity)}</div>`;

      content.append(members);
      content.append(listSection);
      content.append(cfSection);
      content.append(meta);
    })
    .then(() => {
      loading.hide();
      return t.sizeTo('#page');
    });
});
