export namespace MemberComponent {
  
  const avatarInitials = (initials: string): HTMLElement => {
    initials = initials || "X";
    const el = window.document.createElement('span');
    el.className = "initials";
    el.innerText = initials;
    return el;
  }
  export const avatar = (member: any): HTMLElement => {
    if (!member) { return null; }
    if (!member.avatar) { return avatarInitials(member.initials); }

    var img = new Image();
    img.className = "avatar";
    img.alt = `avatar for ${member.initials}`;
    img.src = member.avatar;
    return img;
  }


  export const build  = (member: any): HTMLElement => {
    if (!member) { return null; }
  
    const div = window.document.createElement('div');  
    div.className = "member";
    div.attributes['title'] = member.username;
    
    //avatar
    div.append(avatar(member));

    //name
    const span = window.document.createElement('span');
    span.className = "name";
    span.innerText = member.fullName;
    div.append(span);
      
    return div;
  }
}


