export namespace DateHelper {

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  export const monthLong = (d: Date) => {
    if (d.getMonth) {
      return months[d.getMonth()];
    } 
    //else
    return '';
  }
  export const monthShort = (d: Date) => {
    if (d.getMonth) {
      return months[d.getMonth()].substring(0, 3);
    } 
    //else
    return '';
  }
}