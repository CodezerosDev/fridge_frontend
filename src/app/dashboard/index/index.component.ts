import { Component, OnInit } from '@angular/core';
import * as async from 'async';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
})
export class IndexComponent implements OnInit {

  id: any;
  isLogin: any = false;
  wallet: any;

  showObj: any = {
    userAccount: '',
    chainId: '',
    networkName: ''
  };

  showData: any = [];
  newArray: any = [];
  // {

  //   _tokenLogo:'',
  //   _start_date:'',
  //   _end_date:'',
  //   _hardCap:'',
  //   _softCap:'',
  //   failed:,
  //   collected: ,
  //   _projectInfo:0,
    

  // }

  userAccount: any = [];
  FACORYInstance: any = [];

  constructor(private router: Router,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    private apiService: ApiService

  ) {
    this.checkConnected()

    // this.id = this._route.snapshot.params['id'];
  }
  async ngOnInit() {


  }


  async checkConnected() {
    this.spinner.hide();
    this.showObj.userAccount = await this.apiService.export();

    if (this.showObj.userAccount == undefined || !this.showObj.userAccount.length) {
      this.isLogin = false;
    } else {
      // put the metamask code.
      this.isLogin = true;
      this.wallet = 'Metamask';
      this.FACORYInstance = await this.apiService.exportInstance(environment.FACTORYContract, environment.FACTORYABI);

      this.metaMaskConnected();
    }

  }

  async metaMaskConnected() {
    this.spinner.show()

    await this.getNetworkName();
    await this.getCampainsData();
    this.spinner.hide()

  }


  async getNetworkName() {
    this.showObj.networkName = await this.apiService.getNetworkName();
  }


  async getCampainsData() {

    await this.apiService.getCampainsData().subscribe(async (data) => {

      if (data && data['data']) {
        let res = data['data'];
        if (res && res.length) {
          this.spinner.show();
          this.showData = await data['data'];
          this.newArray = await this.setStatus(this.showData);
          this.spinner.hide();

          console.log('-----------------newsArray', this.newArray)
        }
      }

    })
  }

  async onClickbWaps(address){
    let queryParams = {};
    if (address) {
      queryParams["token_address"] = address;

      await this.router.navigate(['/dashboard/buy'], {
        relativeTo: this._route,
        queryParams: queryParams,
      });

    }
  }
  
  async onClickRoute(address) {

    let queryParams = {};
    if (address) {
      queryParams["token_address"] = address;

      await this.router.navigate(['/dashboard/buy'], {
        relativeTo: this._route,
        queryParams: queryParams,
      });

    }

  }

  onClickRefresh() {
    window.location.reload();
  }


  // async setStatus(resArray,index) {

  //   let returnArray = [];
  //   let tempArray = [];
  //   return await new Promise((resolve, reject) => {


  //     resArray.map(async (x, i) => {

  //       // x = x.toObject();
  //       if (x._token_address && x._token_address != null) {
  //         let campaignAddress
  //         await this.apiService.getCampaignAddress(this.FACORYInstance, this.showObj.userAccount, x._token_address).then(async (data) => {
  //           if (data) {
  //             campaignAddress = await data;
  //           }
  //         }).catch((err) => {
  //           reject(err);
  //         });;

  //         if (campaignAddress && campaignAddress != undefined) {
  //           console.log('--------campaignAddress', campaignAddress);

  //           let campaignInstance;
  //           await this.apiService.exportInstance(campaignAddress, environment.compaignABI).then(async (data) => {
  //             if (data) {
  //               campaignInstance = await data;
  //             }
  //           }).catch((err) => {
  //             reject(err);
  //           });

  //           if (campaignInstance && campaignInstance != undefined) {

  //             x.collected = await this.apiService.collected(campaignInstance, this.showObj.userAccount).then(async (data) => {
  //               if (data) {
  //                 x.collected = await data;
  //               } else {
  //                 x.collected = 0;
  //               }
  //             }).catch((err) => {
  //               reject(err);
  //             });
  //             await this.apiService.isLive(campaignInstance, this.showObj.userAccount).then(async (data) => {
  //               console.log('=========isLive==============',data)
  //               if (data) {
  //                 x.isLive = await data;
  //               } else {
  //                 x.isLive = false;
  //               }
  //             }).catch((err) => {
  //               reject(err);
  //             });;
  //             // [x.collected] = await this.apiService.collected(campaignInstance, this.showObj.userAccount)]);
  //             console.log('--------campaignAddress', x);

  //             await returnArray.push(x);
  //             await tempArray.push('2');


  //             if (resArray.length == tempArray.length) {
  //               console.log('---------------seccedd ')

  //               resolve(returnArray)
  //             }
  //           }

  //         } else {
  //           console.log('---------------else 2 ')
  //           if (resArray.length == tempArray.length) {
  //             resolve(returnArray)
  //           }
  //           tempArray.push('1');

  //         }
  //       } else {
  //         console.log('---------------else 1 ')
  //         if (resArray.length == tempArray.length) {
  //           resolve(returnArray)
  //         }
  //         tempArray.push('1');
  //       }

  //     });

  //   });

  // }


  async setStatus(resArray) {

    this.spinner.show();
    let returnArray = [];
    let tempArray = [];
    return await new Promise(async (resolve, reject) => {

      resArray.forEach(async (x) => {



        // x = x.toObject();
        if (x._token_address && x._token_address != null) {
          let campaignAddress = await this.apiService.getCampaignAddress(this.FACORYInstance, this.showObj.userAccount, x._token_address);

          if (campaignAddress && campaignAddress != undefined) {

            let campaignInstance = await this.apiService.exportInstance(campaignAddress, environment.compaignABI);


            if (campaignInstance && campaignInstance != undefined) {

              x.collected = await campaignInstance.methods.collected().call({
                from: this.showObj.userAccount
              });
              //  this.apiService.collected(campaignInstance, this.showObj.userAccount);

              x.failed = await campaignInstance.methods.failed().call({
                from: this.showObj.userAccount
              });
              // await this.apiService.isLive(campaignInstance, this.showObj.userAccount);

              await returnArray.push(x);
              await tempArray.push('2');


              if (resArray.length == tempArray.length) {
                this.spinner.hide();
                resolve(returnArray)
              }
            }

          } else {
            if (resArray.length == tempArray.length) {
              this.spinner.hide();
              resolve(returnArray)
            }
            tempArray.push('1');

          }
        } else {
          if (resArray.length == tempArray.length) {
            this.spinner.hide();
            resolve(returnArray)
          }
          tempArray.push('1');
        }


      });
    });
    // }


    // // const that = this;
    // for (var i = 0; i < resArray.length; i++) {

    //   if (resArray[i]._token_address && resArray[i]._token_address != null) {
    //     let campaignAddress = this.apiService.getCampaignAddress(this.FACORYInstance, this.showObj.userAccount, resArray[i]._token_address);

    //     if (campaignAddress && campaignAddress != undefined) {
    //       resArray[i].campaignAddress = campaignAddress;

    //       let campaignInstance;

    //       campaignInstance = await this.apiService.exportInstance(campaignAddress, environment.compaignABI);

    //       if (campaignInstance && campaignInstance != undefined) {

    //         await this.apiService.collected(campaignInstance, this.showObj.userAccount).then(async (data) => {
    //           if (data) {
    //             resArray[i].collected = await data;
    //           } else {
    //             resArray[i].collected = 0;
    //           }
    //         }).catch((err) => {
    //           resArray[i].collected = 0;
    //         });
    //         await this.apiService.isLive(campaignInstance, this.showObj.userAccount).then(async (data) => {
    //           console.log('=========isLive==============', data);
    //           if (data) {
    //             resArray[i].isLive = await data;
    //           } else {
    //             resArray[i].isLive = false;
    //           }
    //         }).catch((err) => {
    //           resArray[i].isLive = false;
    //         });;
    //       }

    //     }
    //   }
    // }

    // const that = this;
    // async.map(resArray, async function (x) {
    //   console.log('1')

    //   if (x._token_address && x._token_address != null) {
    //     console.log('2')
    //     let campaignAddress = that.apiService.getCampaignAddress(that.FACORYInstance, that.showObj.userAccount, x._token_address);

    //     if (campaignAddress && campaignAddress != undefined) {
    //       console.log('3')
    //       x.campaignAddress = that.apiService.exportInstance(campaignAddress, environment.compaignABI);
    //       return x;
    //     } else {
    //       return '';
    //     }

    //   } else {
    //     return '';
    //   }

    // }, async (err, results) => {
    //   if (err) throw err


    //   console.log('------------result', results)
    //   console.log('------------err', err)


    // });
  }

}
