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

let proBoardData: IProBoard = {
  ...emptyProBoard,
  //default data
  icon: 'basket-outline',
  order: 0
};


//INITIALIZER
const initialize = () => {

  return trello.Promise.all([
    t.board('id','name'),
    settingsService.get(t),    
  ])
  .then(([board, settings]: [any, ISettings]) => {
    if (!board || !settings) {
      console.warn("Unable to retrieve board and/or settings", {board, settings});
      throw new Error("Unable to initialize page");
    }
    proBoardData.boardId = board.id;
    proBoardData.pendingListId = settings.pending_list_id;
    proBoardData.activeListId = settings.active_list_id;
    proBoardData.doneListId = settings.done_list_id;
    //the following are defaults for the board
    proBoardData.name = board.name;
    proBoardData.shortName = board.name.split(' ').map(words => words.substr(0,1)).join('');  //initials

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
}

const setProBoardData = (field: string, value: string | number) => {
  if (field in proBoardData && (typeof(value) === 'string' || typeof(value) === 'number')) {
    proBoardData[field] = value;
  }
}

//HELPERS
const close = (t?: any) => {
  t = t?.closeModal ? t : trello.t();
  t.closeModal();
  //t.closePopup();
};

const toggleSave = (enabled: boolean) => {
  saveBtn.disabled = !enabled;
}

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

  console.log("DEBUG: pro-board-setup - getFormData", data);
  return data;
}

const validateForm = (data: any = null) => {
  data = data || getFormData();
  return Object.keys(data).every(key => {
    return !!data[key];
  });
}

const updateSaveBtn = () => {
  toggleSave(validateForm());
}

const save = () => {
  const data = {
    ...proBoardData,
    ...getFormData()
  };
  const isValid = validateForm(data);
  if (isValid) {
    loading.show();
    
    //todo: save the data
    console.log("DEBUG: saving the data", {data, proBoardData});
  }
}

const updateElementValues = (data: IProBoard) => {
  data = data || proBoardData;

  Object.keys(emptyProBoard).forEach(key => {
    const el = (window.document.getElementById(key) as HTMLInputElement);
    if (el) {
      el.value = data[key];
    }
  });

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
  return initialize()
  .then((results: any) => {

    //PRESET THE Input/Select ELEMENTS
    updateElementValues(proBoardData);

    //DONE
    updateSaveBtn();
    loading.hide();
    t.sizeTo('#content').done();
  });
});

