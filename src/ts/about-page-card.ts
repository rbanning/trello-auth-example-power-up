import { LoadingService } from "./loading.service";
import { trello } from "./_common";
import { DateHelper } from "./date-helper";
import { MemberComponent } from "./member.component";

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

  const customFieldHtml = (cf: any) => {
    if (!cf) { return null; }
    const value = cf.value?.text || cf.value?.date || cf.value?.number || cf.value?.checked || `opt id: ${cf.idValue}`;
    return `<span class="dark">${value}</span> <br/><code style="margin: 0 1em;">(field: ${cf.idCustomField})</code>`;
  };

  
  const dateHtml = (d: string) => {    
    return `<span class="date">${!!d ? DateHelper.dateMedium(new Date(d)) : 'none'}</span>`;
  };

  const booleanHtml = (bool: string | boolean) => {    
    if (typeof(bool) === 'string') { bool = bool.toLowerCase() === "true"; }
  
    return (bool === null || bool === undefined) ? '' : `<span class="bool">${(bool ? '(DONE)' : '(PENDING)')}</span>`;
  };

  //SETUP CLOSE BUTTON
  window.document.querySelectorAll('.close')
    .forEach(btn => {
      btn.addEventListener('click', close);
    });

  
  //GET ALL OF THE INFORMATION
  t.card('id', 'name', 'due', 'dueComplete', 'members', 'labels', 'attachments', 'url', 'shortLink', 'dateLastActivity', 'customFieldItems')
    .then((card: any) => {
      //subtitle
      const subtitle = window.document.getElementById('subtitle');
      subtitle.innerHTML = card.name;

      console.log("DEBUG: card details", {card});

      //get content element
      const content = window.document.getElementById('content');

      //details
      const details = window.document.createElement('section');
      details.innerHTML = '<h3>Details</h3>'
        + `<div><strong>Due:</strong> ${booleanHtml(card.dueComplete)} ${dateHtml(card.due)}</div>`
        + `<div><strong>Labels:</strong> ${card.labels.length}</div>`
        + `<div><strong>Attachments:</strong> ${card.attachments.length}</div>`;

      //members
      const members = window.document.createElement('section');
      members.innerHTML = '<h3>Members</h3>'
        + (card.members.length === 0 ? '<p><strong>None</strong></p>' : `${card.members.map(memberHtml).join(' ')}`);

      //custom fields
      const cfSection = window.document.createElement('section');
      cfSection.innerHTML = '<h3>Custom Fields</h3>'
        + ((!card.customFieldItems || card.customFieldItems.length === 0) ? '<p><strong>None</strong><p>'
        : `<ul><li>${card.customFieldItems.map(customFieldHtml).join('</li><li>')}</li></ul>`);


      //meta
      const meta = window.document.createElement('section');
      meta.innerHTML = '<h3>Meta Information</h3>'
        + `<div><strong>Id:</strong> ${card.id}</div>`
        + `<div><strong>Short Id:</strong> <a href="https://trello.com/b/${card.shortLink}">${card.shortLink}</a></div>`
        + `<div><strong>Url:</strong> <a href="${card.url}">${card.url}</a></div>`
        + `<div><strong>Last Activity:</strong> ${dateHtml(card.dateLastActivity)}</div>`;

      content.append(details);
      content.append(members);
      content.append(cfSection);
      content.append(meta);
    })
    .then(() => {
      loading.hide();
      return t.sizeTo('#page');
    });
});
