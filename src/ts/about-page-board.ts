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
    return `${list.name} <code>${list.id}</code>`;
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
    t.board('id', 'name', 'shortLink', 'url', 'dateLastActivity', 'members', 'memberships'), //all about the board
    t.lists('id', 'name')
  ];
  trello.Promise.all(actions)
    .then(([board, lists]: [any, any[]] ) => {
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
      listSection.innerHTML = '<h3>Lists<h3>'
        + (!lists || lists.length === 0) ? '<p><strong>None</strong><p>'
        : `<ul><li>${lists.map(listHtml).join('</li><li>')}</li></ul>`;

      //meta
      const meta = window.document.createElement('section');
      meta.innerHTML = '<h3>Meta Information</h3>'
        + `<div><strong>Id:</strong> ${board.id}</div>`
        + `<div><strong>Short Id:</strong> <a href="https://trello.com/b/${board.shortLink}">${board.shortLink}</a></div>`
        + `<div><strong>Url:</strong> <a href="${board.url}">${board.url}</a></div>`
        + `<div><strong>Last Activity:</strong> ${dateHtml(board.dateLastActivity)}</div>`;

      content.append(members);
      content.append(meta);
    })
    .then(() => {
      loading.hide();
      return t.sizeTo('#page');
    });
});
