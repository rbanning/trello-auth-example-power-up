import { HallpassService } from "./hallpass.service";
import { LoadingService } from "./loading.service";
import { ISettings, SettingsService } from "./settings.service";
import { toastr } from "./toastr.service";
import { trello } from "./_common";
import { emptyProBoard, IProBoard } from "./pro-board.interface";

const saveBtn: HTMLButtonElement = (window.document.getElementById('save') as HTMLButtonElement);
if (!saveBtn) {
  throw new Error("Could not locate the save button");
}

const t = trello.t();
const loading = new LoadingService();
loading.show();

const settingsService = new SettingsService();
const hallpassService = new HallpassService(t);

const config: { settings: ISettings, proBoardData: IProBoard } = {
  settings: null,
  proBoardData: {
    ...emptyProBoard,
    //default data
    icon: 'basket-outline',
    order: 0
  }
};


//INITIALIZER
const initialize = () => {

  return trello.Promise.all([
    t.board('id', 'name'),
    settingsService.get(t),    
  ])
  .then(([board, settings]: [any, ISettings]) => {
    if (!board || !settings) {
      console.warn("Unable to retrieve board and/or settings", {board, settings});
      throw new Error("Unable to initialize page");
    }
    config.settings = settings;

    config.proBoardData.boardId = board.id;
    // config.proBoardData.pendingListId = settings.pending_list_id;
    // config.proBoardData.activeListId = settings.active_list_id;
    // config.proBoardData.doneListId = settings.done_list_id;
    //the following are defaults for the board
    config.proBoardData.name = board.name;
    config.proBoardData.shortName = board.name.split(' ').map(words => words.substr(0, 1)).join('');  //initials

    return hallpassService.getProBoard(board.id, true)
      .then((result: IProBoard) => {
        //update proBoardData
        if (result) {
          Object.keys(result)
            .filter(key => ['id', 'name', 'shortName', 'icon', 'order'].includes(key)) //only update these properties
            .forEach(key => {
              setProBoardData(key, result[key]);
            });
        }

        return {board, settings, exists: !!result};
      });
  });
};

const setProBoardData = (field: string, value: string | number) => {
  if (field in config.proBoardData && (typeof(value) === 'string' || typeof(value) === 'number')) {
    config.proBoardData[field] = value;
  }
};

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

const validateForm = (data: any = null) => {
  data = data || getFormData();
  return Object.keys(data).every(key => {
    return !!data[key];
  });
};

const updateSaveBtn = () => {
  toggleSave(validateForm());
};

const save = () => {
  let data: any = getFormData();
  const isValid = validateForm(data);
  if (isValid) {
    loading.show();
    data = {
      ...config.proBoardData,
      ...data
    };

    hallpassService.saveProBoard(data.boardId, data)
      .then(result => {
        //save pro_meeting_id
        //config.settings.pro_meeting_id = result?.id;
        settingsService.save(t, config.settings);

        //DONE
        console.log("DEBUG: success saving pro board config", {data, result});
        toastr.success(t, `Saved changes to '${result?.shortName}'`);        
        close(t);
      })
      .catch(reason => {
        loading.hide();
        console.warn("Error saving the pro board configuration", {reason, data});
        toastr.error(t, "Error saving Pro Board Configuration");
      });
  } else {
    console.warn("Looks like the form is not valid", data);
  }
};

const updateElementValues = (data: IProBoard) => {
  data = data || config.proBoardData;

  Object.keys(emptyProBoard).forEach(key => {
    const el = (window.document.getElementById(key) as HTMLInputElement);
    if (el) {
      el.value = data[key];
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
  return initialize()
  .then((results: any) => {

    //PRESET THE Input/Select ELEMENTS
    updateElementValues(config.proBoardData);

    //DONE
    updateSaveBtn();
    loading.hide();
    t.sizeTo('#content').done();
  });
});

