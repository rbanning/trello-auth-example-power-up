const showToast = (t, display, message, duration) => {
    duration = duration || 5;
    if (duration > 1000) {
        duration = duration / 1000;
    }
    t.hideAlert(); //remove others
    t.alert({
        message,
        duration,
        display
    });
};
const toastFn = (display) => {
    return (t, message, duration) => {
        return showToast(t, display, message, duration);
    };
};
export const toastr = {
    success: toastFn('success'),
    info: toastFn('info'),
    error: toastFn('error'),
    warning: toastFn('warning')
};
//# sourceMappingURL=toastr.service.js.map