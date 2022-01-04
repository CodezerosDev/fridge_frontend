import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timerConvert'
})
export class TimerConvertPipe implements PipeTransform {

  transform(start_date: any, end_date: any): string {

    let currentDate: any = new Date().getTime();

    currentDate = parseInt(currentDate) / 1000
    currentDate = parseInt(currentDate);
    start_date = parseInt(start_date);
    end_date = parseInt(end_date);

    if ((start_date < currentDate) && (end_date > currentDate)) {
      var theDate = new Date(start_date * 1000);
      start_date = theDate.toUTCString();

      return start_date;
    } else if ((currentDate > start_date) && (currentDate > end_date)) {
      return 'Ended';
    } else if (start_date > currentDate) {
      let a: any = (start_date - currentDate);

      // setInterval(() => {
      a = this.ConvertSectoDay(a);
      return a;
    }

    return '-';
  }


  ConvertSectoDay(n) {
    let day: any = n / (24 * 3600);

    n = n % (24 * 3600);
    let hour: any = n / 3600;

    n %= 3600;
    let minutes: any = n / 60;

    n %= 60;
    let seconds: any = n;

    let a = parseInt(day) + ' ' + 'days ' + parseInt(hour) + ' hours ' + parseInt(minutes) + ' minutes ';
    return a;
  }

}
