import { LoadingService } from "./loading.service";
import { SettingsService, setting_fields } from "./settings.service";
import { toastr } from "./toastr.service";
import { trello } from "./_common";
const saveBtn = window.document.getElementById('save');
if (!saveBtn) {
    throw new Error("Could not locate the save button");
}
const t = trello.t();
const loading = new LoadingService();
loading.show();
const settingsService = new SettingsService();
//HELPERS
const close = (t) => {
    t = (t === null || t === void 0 ? void 0 : t.closeModal) ? t : trello.t();
    t.closeModal();
    //t.closePopup();
};
const toggleSave = (enabled) => {
    saveBtn.disabled = !enabled;
};
const getFormData = () => {
    const data = {};
    window.document.querySelectorAll('input')
        .forEach(input => {
        if (input === null || input === void 0 ? void 0 : input.id) {
            data[input.id] = input.value;
        }
    });
    window.document.querySelectorAll('select')
        .forEach(input => {
        if (input === null || input === void 0 ? void 0 : input.id) {
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
            console.warn("Unable to save settings", { reason });
            loading.hide();
        });
    }
};
const updateElementValues = (settings) => {
    settings = settings || {};
    setting_fields.forEach(key => {
        const el = window.document.getElementById(key);
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
        t.lists('id', 'name'),
    ])
        .then((results) => {
        const [settings, lists, board, me] = results;
        //VALIDATION
        if (!Array.isArray(lists)) {
            console.warn("Error getting board lists", { lists });
            throw new Error("Unable to find the board lists");
        }
        //ADD THE LISTs TO SELECTs
        const selects = [
            window.document.getElementById('pending_list_id'),
            window.document.getElementById('active_list_id'),
            window.document.getElementById('done_list_id')
        ];
        if (selects.some(el => !el)) {
            throw new Error("Unable to find one or more of the list select dropdown");
        }
        selects.forEach(select => {
            lists.forEach((item) => {
                const option = window.document.createElement('option');
                option.value = item.id;
                option.innerText = item.name;
                select.add(option);
            });
        });
        //MONITOR CHANGE on SELECTS
        window.document.querySelectorAll('select')
            .forEach(input => {
            input.addEventListener('change', updateSaveBtn);
        });
        //PRESET THE Input/Select ELEMENTS
        updateElementValues(settings);
        //DONE
        updateSaveBtn();
        loading.hide();
        t.sizeTo('#content').done();
    });
});
//# sourceMappingURL=settings.js.map