import { LoadingService } from "./loading.service";
import { trello, env } from "./_common";

const saveBtn: HTMLButtonElement = window.document.querySelector('.save');
if (!saveBtn) {
  throw new Error("Could not locate the save button");
}

const t = trello.t();
const loading = new LoadingService();
loading.show();

//HELPERS
const close = () => {
  trello.t().closePopup();
};

const toggleSave = (enabled: boolean) => {
  if (enabled) {
    saveBtn.setAttribute('disabled','true');
  } else {
    saveBtn.removeAttribute('disabled');
  }
}

const getFormData = () => {
  const data = {};
  window.document.querySelectorAll('input')
    .forEach(input => {
      data[input.id] = input.value;
    });  
  window.document.querySelectorAll('select')
    .forEach(input => {
      data[input.id] = input.value;
    });
  return data;
}

const validateForm = () => {
  const data = getFormData();
  return Object.keys(data).every(key => {
    if (!data[key]) {
      console.log("DEBUG:// validateForm", {key, value: data[key]});
    }

    return !!data[key];
  });
}

const save = () => {
  loading.show();
  const data = getFormData();
  const isValid = validateForm();

  console.log("DEBUG:// save", {data, isValid});
}




//SETUP CLOSE BUTTON(S)
window.document.querySelectorAll('.close')
  .forEach(btn => {
    btn.addEventListener('click', close);
  });


//SETUP SAVE BUTTON
saveBtn.addEventListener('click', save);


//START RENDERING
t.render(() => {
  return trello.Promise.all([
    t.get('board', 'private', env.SETTINGS_KEY),
    t.lists('id','name')
    //add others as needed
  ])
  .then((results: any[]) => {
    const [settings, lists] = results;
    console.log("DEBUG:// settings", {results, settings, lists});

    //ADD THE LISTs TO SELECT
    const select: HTMLSelectElement = (window.document.getElementById('#list_id') as HTMLSelectElement);
    if (!select) { throw new Error("Unable to find the list select dropdown"); }

    lists.forEach((item: any) => {
      const option = window.document.createElement('option');
      option.value = item.id;
      option.innerText = item.name;
      select.add(option);
    });

    //SET THE VALUES
    Object.keys(settings).forEach(key => {
      const el = (window.document.getElementById(`#${key}`) as HTMLInputElement); 
      if (el) { el.value = settings[key]; }
    })

    //DONE
    toggleSave(validateForm());
    loading.hide();
    t.sizeTo('#content').done();
  });


  //todo: get

  //DONE
  toggleSave(validateForm());
  loading.hide();

});

