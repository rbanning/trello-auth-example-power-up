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
const close = (tt?: any) => {
  tt = tt?.closeModal ? tt : trello.t();
  tt.closeModal();
  //t.closePopup();
};

const toggleSave = (enabled: boolean) => {
  saveBtn.disabled = !enabled;
};

const getFormData = () => {
  const data = {};
  window.document.querySelectorAll('input')
    .forEach(input => {
      if (input?.id) {
        //special case for non-required empty value
        if (input.value || input.required) {
          data[input.id] = input.value;
        }
      }
    });  
  window.document.querySelectorAll('select')
    .forEach(input => {
      if (input?.id) {
        data[input.id] = input.value;
      }
    });

  return data;
};

const validateForm = () => {
  const data = getFormData();
  return Object.keys(data).every(key => {
    return !!data[key];
  });
};

const updateSaveBtn = () => {
  toggleSave(validateForm());
};

const save = () => {
  const data = getFormData();
  const isValid = validateForm();
  if (isValid) {
    loading.show();
    settingsService.save(t, data)
      .then(_ => {
        loading.hide();
        toastr.success(t, "Saved Settings");        
        close(t);
      }, (reason) => {
        toastr.error(t, "Error saving settings");
        console.warn("Unable to save settings", {reason});
        loading.hide();
      });
  }
};

const updateElementValues = (settings: ISettings) => {
  settings = settings || {};

  setting_fields.forEach(key => {
    const el = (window.document.getElementById(key) as HTMLInputElement);
    if (el) {
      el.value = settings[key];
    }
  });

};

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
    t.lists('id', 'name'),    //only included as an example
    //add others as needed
  ])
  .then((results: any[]) => {
    const [settings, lists] = results;

    //VALIDATION
    if (!Array.isArray(lists)) {
      console.warn("Error getting board lists", {lists});
      throw new Error("Unable to find the board lists");
    }

    //PRESET THE Input/Select ELEMENTS
    updateElementValues(settings);

    //DONE
    updateSaveBtn();
    loading.hide();
    t.sizeTo('#content').done();
  });
});

