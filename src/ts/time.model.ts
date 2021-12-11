import { DateHelper } from "./date-helper";

export interface ICoordinate {
  latitude: number;
  longitude: number;
}

export interface ITimeModel {
  coordinates: ICoordinate;
  timezone: string;
  
  //the time keepers
  _start: number;
  _initial: number;

  readonly raw: any;

  readonly dayOfTheWeek: string;
  readonly time: string;
  readonly value: Date;
  readonly valid: boolean;

  setInitialTime(d: Date);
  isValid(): boolean;
}

export class TimeModel implements ITimeModel {
  //these need to be public so they are serialized
  public _start: number;   //timestamp used to update the value of the model
  public _initial: number; //the initial value of the time model in milliseconds
  readonly raw: any;

  coordinates: ICoordinate;
  timezone: string;

  get dayOfTheWeek() {
    const d = this.value;
    return d ? DateHelper.dayOfWeek(d) : null;
  }

  get time() {
    const d = this.value;
    return d ? DateHelper.time(d) : null;
  }

  get value() {
    if (this.isValid()) {
      const delta = Date.now() - this._start;
      return new Date(this._initial + delta);
    }
    //else
    return null;
  }

  get valid() {
    return this.isValid();
  }

  constructor(obj: any = null) {
    this.raw = obj;
    if (obj) {
      this.coordinates = obj.coordinates ?? { latitude: obj.latitude, longitude: obj.longitude };
      this.timezone = obj.timezone ?? obj.timeZone;

      if (typeof(obj.value) === 'object' && typeof(obj.value.getTime) === 'function') {
        this.setInitialTime(obj.value);
      }  
      else if ("dateTime" in obj || "datetime" in obj) {
        this.setInitialTime(Date.parse(obj.dateTime ?? obj.datetime));
      } else {
        this._start = obj._start;
        this._initial = obj._initial;
      }
    }
  }



  setInitialTime(d: Date | number) {
    this._start = Date.now();
    this._initial = typeof(d) === 'number' ? d : d.getTime();
  }

  isValid():boolean {
    return this._start > 0 && this._initial > 0;
  }
}