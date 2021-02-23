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
const close = () => {
    trello.t().closePopup();
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
            t.closePopup();
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
        t.lists('id', 'name')
        //add others as needed
    ])
        .then((results) => {
        const [settings, lists] = results;
        //ADD THE LISTs TO SELECT
        const select = window.document.getElementById('active_list_id');
        if (!select) {
            throw new Error("Unable to find the list select dropdown");
        }
        if (!Array.isArray(lists)) {
            console.warn("Error getting board lists", { lists });
            throw new Error("Unable to find the board lists");
        }
        lists.forEach((item) => {
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
//# sourceMappingURL=settings.js.map