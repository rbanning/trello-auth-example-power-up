const showToast = (t: any, display: string, message: string, duration: number) => {
  duration = duration || 5;
  if (duration > 1000) { duration = duration / 1000; }
  t.hideAlert(); //remove others
  t.alert({
    message,
    duration,
    display
  });
};

const toastFn = (display: string) => {
  return (t: any, message: string, duration: number = 5) => {
    return showToast(t, display, message, duration);
  };
};

export const toastr = {
  success: toastFn('success'),
  info: toastFn('info'),
  error: toastFn('error'),
  warning: toastFn('warning')
};
