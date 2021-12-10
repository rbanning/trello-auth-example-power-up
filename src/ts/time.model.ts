import { DateHelper } from "./date-helper";

export interface ICoordinate {
  latitude: number;
  longitude: number;
}

export interface ITimeModel {
  label: string;
  coordinate: ICoordinate;
  timezone: string;
  
  readonly raw: any;

  readonly dayOfTheWeek: string;
  readonly time: string;
  readonly value: Date;
  
  setInitialTime(d: Date);
  isValid(): boolean;
}

export class TimeModel implements ITimeModel {
  private _start: number;   //timestamp used to update the value of the model
  private _initial: number; //the initial value of the time model in milliseconds
  readonly raw: any;

  label: string;
  coordinate: ICoordinate;
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

  constructor(obj: any = null) {
    this.raw = obj;
    if (obj) {
      this.label = obj.label ?? obj.name;
      this.coordinate = obj.coordinate ?? { latitude: obj.latitude, longitude: obj.longitude };
      this.timezone = obj.timezone ?? obj.timeZone;

      if (typeof(obj.value) === 'object' && typeof(obj.value.getTime) === 'function') {
        this.setInitialTime(obj.value);
      }  
      else if ("dateTime" in obj || "datetime" in obj) {
        this.setInitialTime(Date.parse(obj.dateTime ?? obj.datetime));
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