import { Pipe, PipeTransform } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'numberDate'
})
export class NumberDatePipe implements PipeTransform {

  constructor(
    private apiService: ApiService) {
  }

  conditionObj :any = {
    isLive:false,
    softCap:0,
    hardCap:0,
    collected:0,
    token_address:''
  };

  FACORYInstance:any;

  transform(start_date: any, end_date: any,hardCap:any,softCap:any,failed:any , collected:any,type:any): string {

    let currentDate: any = new Date().getTime();

    currentDate = parseInt(currentDate) / 1000
    currentDate = parseInt(currentDate);
    start_date = parseInt(start_date);
    end_date = parseInt(end_date);
    hardCap = parseFloat(hardCap) / environment.divideValue;
    softCap = parseFloat(softCap) / environment.divideValue;

    if(type == 'outside'){
      collected = parseFloat(collected) / environment.divideValue;
    }

    if ((start_date < currentDate) && (end_date > currentDate) ) {

      if((collected >= hardCap )){
        return 'success';
      }
    
      return 'ongoing';


    } else if ((currentDate > start_date) && (currentDate > end_date)) {


      if((collected >= hardCap ||  collected >= softCap ) && !failed){
        return 'success';
      }

      if(failed){
        return 'failed';        
      }

      return 'ended';
      
    } else if (start_date > currentDate) {

      let temp = (start_date - currentDate);

      if(temp < 7200){
        return 'early_birds';   
      }else{

        return 'upcoming';   
      }
    }

    return '-';
  }


  
}
