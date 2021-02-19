import { LoadingService } from "./loading.service";
import { ISettings, SettingsService, setting_fields } from "./settings.service";
import { toastr } from "./toastr.service";
import { trello, env } from "./_common";

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
  console.log("DEBUG:// save", {data, isValid});

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

const _revert = (t: any) => {
  settingsService.reset(t)
    .then(settings => {
      updateElementValues(settings);
      toastr.info(t, 'Settings have been reset');
      t.closePopup();
    });
}

const revert = () => {
  t.popup({
    type: 'confirm',
    title: 'Reset Settings',
    message: 'Are you sure you want to reset the settings back to their original?',
    confirmText: 'Reset',
    onConfirm: _revert,
    confirmStyle: 'danger',
    cancelText: 'Cancel',
  });
}




//SETUP CLOSE BUTTON(S)
window.document.querySelectorAll('.close')
  .forEach(btn => {
    btn.addEventListener('click', close);
  });


//SETUP RESET/REVERT BUTTON
window.document.getElementById('reset')
  .addEventListener('click', revert);

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
    t.lists('id','name')
    //add others as needed
  ])
  .then((results: any[]) => {
    const [settings, lists] = results;
    console.log("DEBUG:// settings", {results, settings, lists});

    //ADD THE LISTs TO SELECT
    const select: HTMLSelectElement = (window.document.getElementById('list_id') as HTMLSelectElement);
    if (!select) { throw new Error("Unable to find the list select dropdown"); }

    if (!Array.isArray(lists)) {
      console.warn("Error getting board lists", {lists});
      throw new Error("Unable to find the board lists");
    }
    lists.forEach((item: any) => {
      const option = window.document.createElement('option');
      option.value = item.id;
      option.innerText = item.name;
      select.add(option);
    });
    select.addEventListener('change', updateSaveBtn);

    updateElementValues(settings);

    //DONE
    updateSaveBtn();
    loading.hide();
    t.sizeTo('#content').done();
  });
});

