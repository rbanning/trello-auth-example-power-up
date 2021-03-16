export namespace CustomFields {
  export interface ICustomFields {
    name: string;
    type: 'select' | 'text' | 'date' | 'number';
    value: any;
  }

  export const build = (defs: any[], items: any[]): ICustomFields[] => {
    if (Array.isArray(defs) && Array.isArray(items)) {

      return defs.map(def => {
        return {
          name: '?',
          type: 'text',
          value: null
        };
      });
    }

    //else
    return null;
  };
}
