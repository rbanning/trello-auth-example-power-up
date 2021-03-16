export namespace CustomFields {
  export interface ICustomFields {
    id: string;
    name: string;
    type: 'list' | 'text' | 'date' | 'number' | 'checkbox';
    value: string | number | boolean;
    raw?: any;
  }

  const parseValue = (value: any): any => {
    let result = null;
    if (value !== null && value !== undefined) { 
      if ('number' in value) {
        value = `${value.number}`;  //ensure it is a string
        result = value.indexOf('.') < 0 ? parseInt(value, 10) : parseFloat(value);
      } 
      else if ('checked' in value) {
        result = `${value}`.toLowerCase() === 'true';
      }
      else if ('date' in value || 'text' in value) {
        result = value.date || value.text;  //treat dates as strings
      }
      else {
        console.warn("Unable to parse custom field value", {value});
      }
     }

    return result;
  };

  const lookupValue = (options: any[], id: string): string => {
    const result = options.find(m => m.id === id);
    return parseValue(result?.value);
  };

  export const build = (defs: any[], items: any[]): ICustomFields[] => {
    if (Array.isArray(defs) && Array.isArray(items)) {
      return defs.map(def => {
        const item = items.find(m => m.idCustomField === def.id);
        let value = item?.value;
        if (item) {  
          value = item.idValue ? lookupValue(def.options, item.idValue) : parseValue(value);
        }

        return {
          id: def.id,
          name: def.name,
          type: def.type,
          value,
          raw: item
        };
      });
    }

    //else
    return null;
  };
}
