import { ISettings, setting_fields } from "./settings.service";

export namespace DynamicIdentity {
  const HEADER_KEYS = {
    "scope-id": "X-Hallpass-Scope",
    "scope-code": "X-Hallpass-Scope-Code",
    challenge: "X-Hallpass-DynamicIdentity-Challenge",
    code: "X-Hallpass-DynamicIdentity-Code",
    user: "X-Hallpass-DynamicIdentity-User",
  };

  const headerKeys = () => {
    return {...HEADER_KEYS};    //clone
  };

  export interface IDynamicIdentityScope {
    id: string;
    code: string;
    name?: string;
    secret: string;
  }

  
  export interface IDynamicIdentityResult {
    user: string;
    scope: IDynamicIdentityScope;
  }

    
  //#region >> HELPERS << 

  const randomizeArray = (array: string[], passes: number = 1) => {
    let tempValue: string = null,
        randomIndex: number = null;
    for (let pass = 0; pass < passes; pass++) {     
      for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        tempValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = tempValue;
      }
    }    
    return array;
  };
  const _CHARS: string[] = "abcdefghijklmnopqrstuvwxyz1234567890".split('');
  let CHARS: string[] = null;

  const getRandomCharsFrom = (values: string | string[], count: number): string => {
    //convert values to array
    if (typeof(values) === 'string') { values = values.split(''); }

    let ret = "";
    for (let i = 0; i < count; i++) {
      ret += values[Math.floor(Math.random() * values.length)];
    }
    return ret;
  };

  const getRandomChars = (count: number): string => {
    //initialize
    if (!CHARS) { CHARS = randomizeArray(_CHARS, 3); }

    return getRandomCharsFrom(CHARS, count);
  };
  
  //#endregion

  export const buildScopeFromSettings = (settings: ISettings): IDynamicIdentityScope => {
    if (settings) {
      return {
        id: settings.scope,
        code: settings.scope_code,
        secret: settings.scope_secret
      };
    }
    //else
    return null;
  };

  export const isValidScope = (scope: IDynamicIdentityScope): boolean => {
    return !!scope && 
        scope.id?.length > 30 &&
        scope.code?.length >= 3 &&
        scope.secret?.length >= 5;
  };

  export const buildChallenge = (scope: IDynamicIdentityScope, user: string): string => {
    if (!isValidScope(scope)) {
      console.warn("Cannot build Dynamic Identity challenge: Invalid Scope", {scope});
      return null;
    }

    const sections: string[] = ['', '', ''];
    const date = new Date();
    const d = {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      dow: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getUTCDay()]
    };

    let parts: string[] = null;
    let putAnyWhere: string[] = null;

    //section one
    let length: number = 5 + d.month % 3;    
    //number of random chars is length - required chars (3)
    putAnyWhere = [scope.code[0], getRandomCharsFrom(scope.secret, 1), getRandomChars(length - 3)];  
    parts = [
      ...randomizeArray(([...putAnyWhere]).join('').split('')),
      d.dow[d.dow.length - 1]
    ];
    sections[0] = parts.join('');

    //section two
    length = 3 + d.day % 3;
    //number of random chars is length - required chars (2)
    putAnyWhere = [getRandomCharsFrom(scope.secret, 1), getRandomChars(length - 2)]; 
    parts = [
      ...randomizeArray(([...putAnyWhere]).join('').split('')),
      d.dow[1]
    ];
    sections[1] = parts.join('');
        
    //section three
    length = 8 + d.year % 3;
    //number of random chars is length - required chars (7)
    putAnyWhere = [scope.code[1], scope.code[2], getRandomCharsFrom(scope.secret, 1), user.substr(0, 3), getRandomChars(length - 7)]; 
    parts = [
      d.dow[0],
      ...randomizeArray(([...putAnyWhere]).join('').split('')),
    ];
    sections[2] = parts.join('');

    return sections.join('-').toLowerCase();
  };

  export const buildCode = (scope: IDynamicIdentityScope, user: string, challenge: string): string => {
    if (!isValidScope(scope)) {
      console.warn("Cannot build Dynamic Identity code: Invalid scope", {scope});
      return null;
    }
    if (!challenge || challenge.length < 16) {
      console.warn("Cannot build Dynamic Identity code: Invalid challenge", {challenge});
      return null;
    }
    if (!user || user.length < 3) {
      console.warn("Cannot build Dynamic Identity code: Invalid user", {user});
      return null;
    }
    

    //convert challenge to sections (three)
    const sections = challenge.split('-'); 
    if (sections.length !== 3) { return null; }

    const length = scope.id.length;
    return scope.id[sections[1].length % length] +      //1
           scope.id[challenge.length % length] +        //2
           scope.id[sections[0].length % length] +      //3
           scope.id[user.length % length] +             //4
           scope.id[sections[2].length % length] +      //5
           scope.id[challenge.charCodeAt(0) % length];  //6
  };

  
  export const getHeaders = (scope: IDynamicIdentityScope, user: string): Headers => {
    if (!scope) { throw new Error("Missing/Invalid scope"); }
    if (!user) { throw new Error("Missing/Invalid user"); }

    const challenge = buildChallenge(scope, user);
    const code = buildCode(scope, user, challenge);

    const headers = new Headers();
    headers.append(HEADER_KEYS["scope-id"], scope.id);
    headers.append(HEADER_KEYS["scope-code"], scope.code);
    headers.append(HEADER_KEYS.challenge, challenge);
    headers.append(HEADER_KEYS.code, code);
    headers.append(HEADER_KEYS.user, user);

    return headers;
  };
  
}
