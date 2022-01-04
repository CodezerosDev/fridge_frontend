import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'divide18'
})
export class Divide18Pipe implements PipeTransform {

  transform(value: any) {

    if (value && value != undefined) {
      let a = (parseInt(value) / environment.divideValue).toFixed(3);
      return a;
    } else {
      return value;
    }
  }

}
