import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
})
export class timePipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    const hrs = Math.floor(value / 60);
    const mins = value % 60;
    if (hrs && mins) {
      return `${hrs} hour ${mins} mins`;
    }
    if (hrs) {
      return `${hrs} hour` + (hrs > 1 ? 's' : '');
    }
    if (mins) {
      return `${mins} min` + (mins > 1 ? 's' : '');
    }
    return '';
  }
}
