import { LoadingService } from "./loading.service";
import { ISettings, SettingsService, setting_fields } from "./settings.service";
import { toastr } from "./toastr.service";
import { trello } from "./_common";

const saveBtn: HTMLButtonElement = (window.document.getElementById('save') as HTMLButtonElement);
if (!saveBtn) {
  throw new Error("Could not locate the save button");
}

const t = trello.t();
const loading = new LoadingService();
loading.show();

const settingsService = new SettingsService();

//HELPERS
const close = () => {
  trello.t().closePopup();
};

const toggleSave = (enabled: boolean) => {
  saveBtn.disabled = !enabled;
}

const getFormData = () => {
  const data = {};
  window.document.querySelectorAll('input')
    .forEach(input => {
      if (input?.id) {
        data[input.id] = input.value;
      }
    });  
  window.document.querySelectorAll('select')
    .forEach(input => {
      if (input?.id) {
        data[input.id] = input.value;
      }
    });

  return data;
}

const validateForm = () => {
  const data = getFormData();
  return Object.keys(data).every(key => {
    return !!data[key];
  });
}

const updateSaveBtn = () => {
  toggleSave(validateForm());
}

const save = () => {
  const data = getFormData();
  const isValid = validateForm();
  if (isValid) {
    loading.show();
    settingsService.save(t, data)
      .then(_ => {
        loading.hide();
        toastr.success(t, "Saved Settings");        
        t.closePopup();
      }, (reason) => {
        toastr.error(t, "Error saving settings");
        console.warn("Unable to save settings", {reason});
        loading.hide();
      });
  }
}

const updateElementValues = (settings: ISettings) => {
  settings = settings || {};

  setting_fields.forEach(key => {
    const el = (window.document.getElementById(key) as HTMLInputElement);
    if (el) {
      el.value = settings[key];
    }
  });

}

const memberHtml = (member, membership, locked) => {
  return `<div class="member${locked ? ' locked' :''}" title="${member.username}">` +
      `<img src="${member.avatar}" alt="avatar"/>` +
      `<span class="name">${member.fullName}</span>` +
      `<span class="membership">${membership?.memberType || 'unknown'}</span>` +
      `</div>`;
}


//SETUP CLOSE BUTTON(S)
window.document.querySelectorAll('.close')
  .forEach(btn => {
    btn.addEventListener('click', close);
  });

//SETUP SAVE BUTTON
saveBtn.addEventListener('click', save);

//SETUP THE INPUT BUTTONS (onChange)
window.document.querySelectorAll('input')
  .forEach(input => {
    input.addEventListener('change', updateSaveBtn);
  });


//START RENDERING
t.render(() => {
  return trello.Promise.all([
    settingsService.get(t),
    t.lists('id','name'),
    t.board('id','name','members','memberships'),
    t.member('all')
    //add others as needed
  ])
  .then((results: any[]) => {
    const [settings, lists, board, me] = results;

    //VALIDATION
    if (!Array.isArray(lists)) {
      console.warn("Error getting board lists", {lists});
      throw new Error("Unable to find the board lists");
    }
    if (!Array.isArray(board?.members) || !Array.isArray(board.memberships)) {
      console.warn("Error getting board members/memberships", {board});
      throw new Error("Unable to find the board members/memberships");
    }
    me.membership = board.memberships.find(m => m.idMember === me.id);
    if (!me.membership) {
      console.warn("Error getting my board membership", {me, board});
      throw new Error("Unable to find your board membership");
    }

    //ADD THE LISTs TO SELECTs
    const selects: HTMLSelectElement[] = [
      (window.document.getElementById('pending_list_id') as HTMLSelectElement),
      (window.document.getElementById('active_list_id') as HTMLSelectElement),
      (window.document.getElementById('done_list_id') as HTMLSelectElement)
    ];    
    if (selects.some(el => !el)) { throw new Error("Unable to find one or more of the list select dropdown"); }

    selects.forEach(select => {
      lists.forEach((item: any) => {
        const option = window.document.createElement('option');
        option.value = item.id;
        option.innerText = item.name;
        select.add(option);
      });
      select.addEventListener('change', updateSaveBtn);  
    });

    //PRESET THE Input/Select ELEMENTS
    updateElementValues(settings);

    //SETUP THE MEMBERSHIPs
    const members = window.document.getElementById('members');
    if (!members) { throw new Error("Unable to find the #members element"); }
    members.innerHTML = board.members.map(m => {
      return memberHtml(m, board.memberships.find(x => x.idMember === m.id), m.id === me.id);
    });

    //DONE
    updateSaveBtn();
    loading.hide();
    t.sizeTo('#content').done();
  });
});

