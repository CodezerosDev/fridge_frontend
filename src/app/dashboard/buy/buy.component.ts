import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { env } from 'node:process';
import { ApiService } from 'src/app/api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
})
export class BuyComponent implements OnInit {

  isLogin: any = false;
  wallet: any;

  showObjData: any = {
    userAccount: '',
    campaignAddress: ''
  };

  token_address: any;
  showData: any = [];
  showObj: any = {
  };
  FACORYInstance: any;
  campaignInstance: any;
  buyForm: FormGroup;
  submitted1: Boolean = false;

  setDropdownObj2: any = {};
  setDropdownObj1: any = {
    _tokenName: 'BNB',
    _tokenLogo: './../../../assets/images/BNB.png'
  };



  conditionObj: any = {
    isLive: false,
    failed: false,
    end_date: false,
    locked: 0,
    softCap: 0,
    hardCap: 0,
    participant: 0,
    owner: '',
    doRefund: false,
    end_datePlus2Hours: 0,
    end_dateSecs: 0,
    currentTime: 0,
    factory_owner: '',
  }
  constructor(private route: ActivatedRoute,
    private router: Router,
    private toaster: ToastrService,
    private cd: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private apiService: ApiService) {

    this.route.queryParams.subscribe(async params => {
      if (params) {
        if (params['token_address']) {
          this.token_address = params['token_address'];
          await this.getActiveCampainsDataByAddress(this.token_address)
        }
      }
    });


    // await this.router.navigate(['/internal-category'], {
    //   relativeTo: this.route,
    //   queryParams: queryParams,
    // });

  }

  async ngOnInit() {

    this.buildBuyForm();
    await this.getData();

    // await this.checkConnected();
  }

  async checkConnected() {

    this.showObjData.userAccount = await this.apiService.export();

    if (this.showObjData.userAccount == undefined || !this.showObjData.userAccount.length) {
      this.isLogin = false;
    } else {
      // put the metamask code.
      this.isLogin = true;
      this.wallet = 'Metamask';

      this.FACORYInstance = await this.apiService.exportInstance(environment.FACTORYContract, environment.FACTORYABI);

      if (this.FACORYInstance && this.FACORYInstance != undefined && this.token_address && this.token_address != undefined) {

        await this.getCampaignAddress(this.FACORYInstance, this.showObjData.userAccount, this.apiService);
      }

    }

  }


  async getCampaignAddress(contractInstance, walletAddress, service) {

    await service.getCampaignAddress(contractInstance, walletAddress, this.token_address).then(async (data: any) => {
      if (data) {


        this.showObjData.campaignAddress = await data;
        this.campaignInstance = await this.apiService.exportInstance(this.showObjData.campaignAddress, environment.compaignABI);

        if (this.campaignInstance && this.campaignInstance != undefined) {

          await this.apiService.collected(this.campaignInstance, this.showObjData.userAccount).then(async (data: any) => {

            // if (data) {

            this.showObj.collected = await data;
            this.cd.markForCheck();
            // }
          }).catch((er) => {
            // err code
          });

          // await this.collected(this.campaignInstance, this.showObjData.userAccount, this.apiService);
          await this.isLive(this.campaignInstance, this.showObjData.userAccount, this.apiService);
          await this.failed(this.campaignInstance, this.showObjData.userAccount, this.apiService);
          await this.locked(this.campaignInstance, this.showObjData.userAccount, this.apiService);

          await this.softCap(this.campaignInstance, this.showObjData.userAccount, this.apiService);
          await this.hardCap(this.campaignInstance, this.showObjData.userAccount, this.apiService);

          await this.participant(this.campaignInstance, this.showObjData.userAccount, this.apiService);
          await this.doRefund(this.campaignInstance, this.showObjData.userAccount, this.apiService);
          await this.owner(this.campaignInstance, this.showObjData.userAccount, this.apiService);
          await this.end_date(this.campaignInstance, this.showObjData.userAccount, this.apiService);
          await this.factory_owner(this.campaignInstance, this.showObjData.userAccount, this.apiService);


        }
      }
    }).catch((er) => {
      // err code
    });
  }

  async end_date(contractInstance, walletAddress, service) {
    await service.end_date(contractInstance, walletAddress).then(async (data: any) => {
      if (data) {
        console.log('------------end time------', data)
        let currentDate: any = new Date().getTime();

        this.conditionObj.currentTime = currentDate;
        console.log('------------currentTime------', this.conditionObj.currentTime)

        currentDate = parseInt(currentDate) / 1000

        let end_date = parseInt(data);

        this.conditionObj.end_dateSecs = parseInt(data);
        this.conditionObj.end_datePlus2Hours = (parseInt(data) + 86400) * 1000;

        console.log('------------end_datePlus2Hours------', this.conditionObj.end_datePlus2Hours)

        if (end_date < currentDate) {
          this.conditionObj.end_date = true;

        } else {
          this.conditionObj.end_date = false;

        }
      }
    }).catch((er) => {
      // err code
    });
  }

  async factory_owner(contractInstance, walletAddress, service) {
    // await service.factory_owner(contractInstance, walletAddress).then(async (data: any) => {
    //   if (data) {

    this.conditionObj.factory_owner = '0x7A06a7607a4d175532533F0a41b155D074c9CA27';
    //   }
    // }).catch((er) => {
    //   // err code
    // });
  }

  // 
  async participant(contractInstance, walletAddress, service) {
    await service.participant(contractInstance, walletAddress).then(async (data: any) => {
      if (data) {
        this.conditionObj.participant = data;
      }
    }).catch((er) => {
      // err code
    });
  }

  async owner(contractInstance, walletAddress, service) {
    service.owner(contractInstance, walletAddress).then(async (data: any) => {
      if (data) {

        this.conditionObj.owner = data;
      }
    }).catch((er) => {
      // err code
    });
  }



  async isLive(contractInstance, walletAddress, service) {
    service.isLive(contractInstance, walletAddress).then(async (data: any) => {
      if (data) {

        this.conditionObj.isLive = data;
      }
    }).catch((er) => {
      // err code
    });
  }
  async doRefund(contractInstance, walletAddress, service) {
    service.doRefund(contractInstance, walletAddress).then(async (data: any) => {
      console.log('-------------------doRefund', data)

      if (data) {

        this.conditionObj.doRefund = data;
      }
    }).catch((er) => {
      // err code
    });
  }

  async failed(contractInstance, walletAddress, service) {
    service.failed(contractInstance, walletAddress).then(async (data: any) => {
      if (data) {
        console.log('-------------------failed', data)

        this.conditionObj.failed = data;
      }
    }).catch((er) => {
      // err code
    });
  }

  async locked(contractInstance, walletAddress, service) {
    service.locked(contractInstance, walletAddress).then(async (data: any) => {
      console.log('-------------------locked', data)

      if (data) {

        this.conditionObj.locked = data;
      }
    }).catch((er) => {
      // err code
    });
  }

  async softCap(contractInstance, walletAddress, service) {
    service.softCap(contractInstance, walletAddress).then(async (data: any) => {
      if (data) {

        this.conditionObj.softCap = data;
      }
    }).catch((er) => {
      // err code
    });
  }

  async hardCap(contractInstance, walletAddress, service) {
    service.hardCap(contractInstance, walletAddress).then(async (data: any) => {
      if (data) {

        this.conditionObj.hardCap = data;
      }
    }).catch((er) => {
      // err code
    });
  }


  async collected(contractInstance, walletAddress, service) {
    service.collected(contractInstance, walletAddress).then(async (data: any) => {
      if (data) {

        this.showObj.collected = data;
        this.cd.markForCheck();
      }
    }).catch((er) => {
      // err code
    });
  }



  // 

  buildBuyForm() {
    this.buyForm = this._formBuilder.group({
      amount1: ['', [Validators.required]],
      amount2: ['', [Validators.required]],

    });
  }


  async getActiveCampainsDataByAddress(token_address) {
    console.log(' api call')
    this.spinner.show();
    await this.apiService.getActiveCampainsDataByAddress(token_address).subscribe(async (data) => {
      if (data && data['success']) {
        this.spinner.hide();

    // this.showObj = {
    //   collected: "96.55",
    //   createdAt: "2021-04-16T10:04:21.146Z",
    //   updatedAt: "2021-04-16T10:04:21.146Z",
    //   __v: 0,
    //   _discordLink: "https://discord.gg/bM8KbsKK",
    //   _end_date: "1618758025",
    //   _hardCap: "1200000000000000000000",
    //   _id: "60796125ba834ac8821c1dbd",
    //   _lock_duration: "15552000",
    //   _max_allowed: "15000000000000000000",
    //   _min_allowed: "100000000000000000",
    //   _pancake_rate: "600",
    //   _pool_rate: "1.53",
    //   _projectInfo: "FollowSwaps is a DEX version of Etoro mirror trading with Limit order feature for PancakeSwap",
    //   _projectName: "FollowSwaps",
    //   _rate: "2000000000000000000",
    //   _rnAMM: 100,
    //   _softCap: "500000000000000000000",
    //   _start_date: "1618585225",
    //   _telegramLink: "https://t.me/FollowSwaps_CHAT",
    //   _tokenAmount: "2400000000000000000000",
    //   _tokenLogo: "http://res.cloudinary.com/prakash-harvani/image/upload/v1618567342/111111111111111.png",
    //   _tokenName: "bWAPS",
    //   _tokenPerBNB: "1.53",
    //   _token_address: "0x0C79B8F01D6F0dd7ca8C98477EBf0998e1DbAf91",
    //   _transactionHash: "0x6436b0d5d6bcd9e947c0294b86f61f001e78c30829305bc2e5f229e2177cf871",
    //   _twitterLink: "https://twitter.com/swapsfollow",
    //   _walletAddress: "0x8CB48F50F1cBF04ab90B25C7d7Ea96e07e9Bf0a6",
    //   _website: "https://followswaps.com/",
    // };

    this.setDropdownObj2 = {
      _tokenName: this.showObj._tokenName,
      _tokenLogo: this.showObj._tokenLogo
    };


    await this.checkConnected();

      } else {
        this.spinner.hide();

        this.toaster.error(data['message']);
      }
    })
  }


  async getData() {
//     await this.apiService.getActiveCampainsData().subscribe((data) => {
//       if (data && data['success']) {
// console.log('-------------------------------get data resp-------',data['data']);
//         if (data && data['data']) {
          this.showData = [{
            collected: "96.55",
            createdAt: "2021-04-16T10:04:21.146Z",
            updatedAt: "2021-04-16T10:04:21.146Z",
            __v: 0,
            _discordLink: "https://discord.gg/bM8KbsKK",
            _end_date: "1618758025",
            _hardCap: "1200000000000000000000",
            _id: "60796125ba834ac8821c1dbd",
            _lock_duration: "15552000",
            _max_allowed: "15000000000000000000",
            _min_allowed: "100000000000000000",
            _pancake_rate: "600",
            _pool_rate: "1.53",
            _projectInfo: "FollowSwaps is a DEX version of Etoro mirror trading with Limit order feature for PancakeSwap",
            _projectName: "FollowSwaps",
            _rate: "2000000000000000000",
            _rnAMM: 100,
            _softCap: "500000000000000000000",
            _start_date: "1618585225",
            _telegramLink: "https://t.me/FollowSwaps_CHAT",
            _tokenAmount: "2400000000000000000000",
            _tokenLogo: "http://res.cloudinary.com/prakash-harvani/image/upload/v1618567342/111111111111111.png",
            _tokenName: "bWAPS",
            _tokenPerBNB: "1.53",
            _token_address: "0x0C79B8F01D6F0dd7ca8C98477EBf0998e1DbAf91",
            _transactionHash: "0x6436b0d5d6bcd9e947c0294b86f61f001e78c30829305bc2e5f229e2177cf871",
            _twitterLink: "https://twitter.com/swapsfollow",
            _walletAddress: "0x8CB48F50F1cBF04ab90B25C7d7Ea96e07e9Bf0a6",
            _website: "https://followswaps.com/",
          }];
    //     }

    //   } else {
    //     this.toaster.error(data['message']);
    //   }
    // })
  }

  async onCliclDropDown(obj) {
    this.setDropdownObj2 = {
      _tokenName: obj._tokenName,
      _tokenLogo: obj._tokenLogo
    };

    let queryParams = {};
    queryParams["token_address"] = obj._token_address;

    await this.router.navigate(['/dashboard/buy'], {
      relativeTo: this.route,
      queryParams: queryParams,
    }).then(() => {
      this.onClickRefresh()
    });

  }
  onClickRefresh() {
    window.location.reload();
  }

  async onClickBuy() {
    this.submitted1 = true;
    if (this.buyForm.invalid) {
      this.toaster.info('Please enter valid data.');
    } else {
      let result = this.buyForm.value;

      if (result.amount1 > 0 && result.amount2 > 0) {

        let minBNB = this.showObj._min_allowed / environment.divideValue;
        let maxBNB = this.showObj._max_allowed / environment.divideValue;

        if (result.amount1 >= minBNB && result.amount1 <= maxBNB) {
          if (this.campaignInstance && this.campaignInstance != undefined) {
            this.spinner.show();

            await this.apiService.buy(this.campaignInstance, this.showObjData.userAccount, result.amount1).then((resApprove) => {
              this.spinner.hide();

              if (resApprove) {
                this.spinner.hide();
                this.toaster.success('Tokens successfully purchased.');
                this.onClickRefresh();
              }
            }).catch((er) => {
              if (er && er.code) {
                this.spinner.hide();
                this.toaster.error(er.message)
              }
            });
          }


        } else {
          this.toaster.info(`From should be minimum ${minBNB}  maximum ${maxBNB}.`);
        }
      } else {
        this.toaster.info('0 or less than 0 amount is now allowed.');
      }

    }
  }


  onAmount1KeyUp(e) {

    if (e && e.target.value) {

      if (this.showObj && this.showObj._tokenPerBNB) {

        let tokenPerBNB: any = parseFloat(this.showObj._tokenAmount).toFixed(4);
        let hardCap: any = parseFloat(this.showObj._hardCap).toFixed(4);

        let tmp: any = hardCap / environment.divideValue;
        hardCap = parseFloat(tmp).toFixed();

        let tmp1: any = tokenPerBNB / environment.divideValue;
        tokenPerBNB = parseFloat(tmp1).toFixed();


        let a = (tokenPerBNB / hardCap) * parseFloat(e.target.value);

        this.buyForm.patchValue({ 'amount2': a });
      }


    } else {
      this.buyForm.patchValue({ 'amount1': '', 'amount2': '' });
    }

  }


  async onClickWithDrawFund() {
    this.spinner.show();

    await this.apiService.withdrawFunds(this.campaignInstance, this.showObjData.userAccount).then(async (data: any) => {
      this.spinner.hide();

      if (data) {
        this.onClickRefresh();

      }
    }).catch((er) => {
      this.spinner.hide();

      // err code
    });
  }

  async onClickLockLiquidity() {
    this.spinner.show();

    await this.apiService.fridgeVAULT(this.campaignInstance, this.showObjData.userAccount).then(async (data: any) => {
      this.spinner.hide();

      if (data) {
        this.onClickRefresh();

      }
    }).catch((er) => {
      this.spinner.hide();

      // err code
    });
  }

  async onClickWithdrawTokens() {
    this.spinner.show();

    await this.apiService.withdrawTokens(this.campaignInstance, this.showObjData.userAccount).then(async (data: any) => {
      this.spinner.hide();

      if (data) {
        this.onClickRefresh();

      }
    }).catch((er) => {
      this.spinner.hide();

      // err code
    });
  }

  async onClickExit() {

    this.spinner.show();
    // withDrawRemainingAssets
    await this.apiService.exit(this.campaignInstance, this.showObjData.userAccount).then(async (data: any) => {
      this.spinner.hide();

      if (data) {

        this.onClickRefresh();
      }
    }).catch((er) => {
      this.spinner.hide();

      // err code
    });

  }

  async onClickWithdrawRemainAssets() {


    this.spinner.show();
    // withDrawRemainingAssets
    await this.apiService.withDrawRemainingAssets(this.campaignInstance, this.showObjData.userAccount).then(async (data: any) => {
      this.spinner.hide();

      if (data) {

        this.onClickRefresh();
      }
    }).catch((er) => {
      this.spinner.hide();

      // err code
    });

  }
}
