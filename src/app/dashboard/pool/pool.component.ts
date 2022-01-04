import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/api.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-pool',
  templateUrl: './pool.component.html',
  styleUrls: ['./pool.component.scss'],
})
export class PoolComponent implements OnInit {
  closeResult: string;

  showObj: any = {
    approved: 0,
    staked: 0,
    earned: 0,
    balance: 0,
    totalSupply: 0,
    networkshare: 0,
    perHour: 0,
    perDay: 0,
    perWeek: 0,
    perYear: 0,
    earnHour: 0,
    earnDay: 0,
    earnWeek: 0,
    earnYear: 0,
    decimal: 18,
    divideValue: environment.divideValue,
    userAccount: ''
  };

  stakeInstance: any;
  lpInstance: any;

  unStakeForm: FormGroup;
  stakeForm: FormGroup;

  submitted1: Boolean = false;
  submitted2: Boolean = false;
  isLogin: any = false;
  wallet: any;



  constructor(
    private router: Router,
    private _formBuilder: FormBuilder,
    private apis: ApiService,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private dtr: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal
  ) {


  }



  open(content) {
    this.modalService.open(content, { centered: true });
  }

  async ngOnInit() {


    this.buildUnStakeForm();
    this.buildStakeForm();
    await this.checkConnected()


  }

  async checkConnected() {

    this.showObj.userAccount = await this.apis.export();

    if (this.showObj.userAccount == undefined || !this.showObj.userAccount.length) {
      this.isLogin = false;
    } else {
      // put the metamask code.
      this.isLogin = true;
      this.wallet = 'Metamask';
      await this.spinner.show();

      this.stakeInstance = await this.apis.exportInstance(environment.poolAddress, environment.poolABI);
      this.lpInstance = await this.apis.exportInstance(environment.FRIDGEETHFLP, environment.FRIDGEETHFLPABI);

      if (this.lpInstance && this.lpInstance != undefined && this.stakeInstance && this.stakeInstance != undefined) {

        await this.earnedTokens(this.stakeInstance, this.showObj.userAccount, this.apis);
        await this.balanceOfStaked(this.stakeInstance, this.showObj.userAccount, this.apis);

        await this.balanceOf(this.lpInstance, this.showObj.userAccount, this.apis);
        await this.allowance(this.lpInstance, this.showObj.userAccount, environment.poolAddress, this.apis);

        // this.showObj.perHour = Math.floor((environment.perSecFRIDGE_ETH_FLP * environment.secPerHour) * 1000000) / 1000000;
        // this.showObj.perDay = Math.floor((environment.perSecFRIDGE_ETH_FLP * environment.secPerDay) * 1000000) / 1000000;;
        // this.showObj.perWeek = Math.floor((environment.perSecFRIDGE_ETH_FLP * environment.secPerWeek) * 1000000) / 1000000;;
        // this.showObj.perYear = Math.floor((environment.perSecFRIDGE_ETH_FLP * environment.secPerYear) * 1000000) / 1000000;;

        await this.totalSupply(this.stakeInstance, this.showObj.userAccount, this.apis);

        await this.spinner.hide();


      } else {
        await this.spinner.hide();
      }
    }

  }



  buildUnStakeForm() {
    this.unStakeForm = this._formBuilder.group({
      amount: ['', [Validators.required]],
    });
  }
  buildStakeForm() {
    this.stakeForm = this._formBuilder.group({
      amount: ['', [Validators.required]],
    });
  }


  // for earned 
  async earnedTokens(contractInstance, walletAddress, service) {

    service.earned(contractInstance, walletAddress).then((data: any) => {
      if (data && data > 0) {
        console.log('---------earned----', data)

        this.showObj.earned = (parseFloat(data) / this.showObj.divideValue).toFixed(4);
        console.log('------showObj---earned----', this.showObj.earned)

      }
    }).catch((er) => {
      this.toaster.error('there is some issue with get earned');
    });
  }


  // for balance GET
  async balanceOf(contractInstance, walletAddress, service) {
    service.getBalance(contractInstance, walletAddress).then((data: any) => {
      if (data && data > 0) {
        console.log('-------------', data)

        this.showObj.balance = (parseFloat(data)).toFixed(2)


        console.log('---------balance----', this.showObj.balance)

      }
    }).catch((er) => {
      // err code
    });
  }

  // for balance GET
  async balanceOfStaked(contractInstance, walletAddress, service) {
    service.getBalance(contractInstance, walletAddress).then((data: any) => {
      if (data && data > 0) {
        this.showObj.staked = (parseFloat(data)).toFixed(2)

      }
    }).catch((er) => {
      // err code
    });
  }

  async totalSupply(contractInstance, walletAddress, service) {
    await service.totalSupply(contractInstance, walletAddress).then((data: any) => {
      if (data && data > 0) {

        this.showObj.totalSupply = Math.floor((data / this.showObj.divideValue) * 1000000) / 1000000;

        this.showObj.networkshare = (this.showObj.staked / this.showObj.totalSupply * 100).toFixed(6);

        this.showObj.earnHour = (this.showObj.networkshare * this.showObj.perHour / 100).toFixed(6);
        this.showObj.earnDay = (this.showObj.networkshare * this.showObj.perDay / 100).toFixed(6);
        this.showObj.earnWeek = (this.showObj.networkshare * this.showObj.perWeek / 100).toFixed(6);
        this.showObj.earnYear = (this.showObj.networkshare * this.showObj.perYear / 100).toFixed(6);

      }
    }).catch((er) => {
      // err code
    });
  }


  async allowance(contractInstance, walletAddress, contractAddress, service) {
    await service.allowance(contractInstance, walletAddress, contractAddress).then(async (data: any) => {

      if (data && data != NaN && data > 0) {
        this.showObj.approved = (parseFloat(data)).toFixed(2);

        // this.show = 'stake';
      } else {
        this.showObj.approved = 0;
      }
    }).catch((er) => {
      // err code
    });
  }


  async onClickApprove() {
    // this.submitted1 = true;
    if (this.showObj.balance == 0) {
      this.toaster.info('You dont have enough balance.')
    } else {

      let address = environment.poolAddress;
      let instance = this.lpInstance;

      let service: any = '';
      service = this.apis;


      address = this.stakeInstance['_address'];

      this.spinner.show();
      await service.approve(instance, address, this.showObj.balance, this.showObj.userAccount).then((receipt) => {
        this.spinner.hide();
        if (receipt) {
          this.onClickRefresh();
        }
      }).catch((er) => {
        this.spinner.hide();
        if (er && er.code) {
        } else {
          this.toaster.error(er);
        }
      })

    }
  }

  //---------------------------stake

  checkStakeAmt(e) {

    if (e.target.value) {
      if (parseFloat(e.target.value) <= this.showObj.approved) {
        if (parseFloat(e.target.value) < 0) {
          this.stakeForm.patchValue({ 'amount': '' });
          this.toaster.info('Amount: Must be value greater than 0.');
        } else {
          // let amt: any = Math.floor((e.target.value) * 1000000) / 1000000;
          // this.stakeForm.patchValue({ 'amount': amt });
        }
      } else {
        this.stakeForm.patchValue({ 'amount': '' });
        this.toaster.info('You do not have enough balance.');
      }
    }

  }

  onClickStakeMax() {
    console.log('-=----------', this.showObj.approved)
    if (this.showObj.approved > 0) {
      console.log('-=-------if---',)

      this.stakeForm.patchValue({ 'amount': this.showObj.approved });
    }
  }

  async onClickStake() {
    this.submitted1 = true;
    if (this.stakeForm.invalid) {
      return;
    } else {

      if (this.stakeForm.value.amount < 0.000001) {
        this.toaster.info('Can not stake less then 0.000001');
      } else {
        this.submitted1 = false;

        let instance = this.stakeInstance;

        let service: any = this.apis;

        this.spinner.show();

        await service.stake(instance, this.stakeForm.value.amount, this.showObj.userAccount).then(async (receipt) => {
          this.spinner.hide();
          if (receipt) {
            this.stakeForm.reset();
            this.onClickRefresh();
          }
        }).catch((er) => {
          this.spinner.hide();
          if (er && er.code) {
            this.toaster.error(er.message);
            this.stakeForm.reset();
            this.submitted1 = false;
          }
        });
      }

    }
  }


  //---------------------------unstake

  checkUnStakeAmt(e) {

    if (e.target.value) {
      if (parseFloat(e.target.value) <= this.showObj.staked) {
        if (parseFloat(e.target.value) < 0) {
          this.unStakeForm.patchValue({ 'amount': '' });
          this.toaster.info('Amount: Must be value greater than 0.');
        } else {
          // let amt: any = Math.floor((e.target.value) * 1000000) / 1000000;
          // this.unStakeForm.patchValue({ 'amount': amt });

          // this.unStakeForm.patchValue({ 'amount': (e.target.value).toFixed() });

        }
      } else {
        this.unStakeForm.patchValue({ 'amount': '' });
        this.toaster.info('You do not have enough balance.');
      }
    }

  }

  onClickUnStakeMax() {
    if (this.showObj.staked > 0) {
      this.unStakeForm.patchValue({ 'amount': this.showObj.staked });
    }
  }


  async onClickUnStack() {
    this.submitted2 = true;
    if (this.unStakeForm.invalid) {
      return;
    } else {
      if (this.unStakeForm.value.amount < 0.000001) {
        this.toaster.info('Can not unstake less then 0.000001');
      } else {
        this.submitted2 = false;

        let instance = this.stakeInstance;

        let service: any = this.apis;


        this.spinner.show();

        await service.withdraw(instance, this.unStakeForm.value.amount, this.showObj.userAccount).then(async (receipt) => {
          this.spinner.hide();
          if (receipt) {
            this.unStakeForm.reset();
            this.onClickRefresh();
          }
        }).catch((er) => {
          this.spinner.hide();
          if (er && er.code) {
            this.toaster.error(er.message);
            this.unStakeForm.reset();
            this.submitted2 = false;
          }
        });

      }

    }
  }



  async getReward() {
    if (this.showObj.earned && this.showObj.earned > 0) {
      if (this.showObj.userAccount) {
        let instance = this.stakeInstance;

        let service: any = this.apis;

        this.spinner.show();
        service.getReward(instance, this.showObj.userAccount).then((receipt) => {
          this.spinner.hide();
          if (receipt) {
            this.onClickRefresh();
          }
        }).catch((er) => {
          this.spinner.hide();
          if (er) {
            this.toaster.error(er.message);
          }
        })


      }
    } else {
      this.toaster.info('You dont have reward.')
    }
  }



  onClickClose() {
    this.submitted1 = false;
    this.submitted2 = false;
    this.stakeForm.patchValue({ 'amount': '' });
    this.unStakeForm.patchValue({ 'amount': '' });
  }


  onClickRefresh() {
    window.location.reload();
  }
}
