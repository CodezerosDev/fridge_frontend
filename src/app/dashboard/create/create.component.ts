import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ApiService } from '../../api.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
})
export class CreateComponent implements OnInit {
  activeStep: number = 1;

  public min = new Date();

  id: any;
  isLogin: any = false;
  wallet: any;

  showObj: any = {
    userAccount: '',
    chainId: '',
    networkName: '',
    FRIDGEBalance: 0
  };

  FRIDGEInstance: any;
  FACORYInstance: any;
  imageURL: any = '';
  createForm1: FormGroup;
  createForm2: FormGroup;
  createForm3: FormGroup;

  submitted1: Boolean = false;
  submitted2: Boolean = false;
  submitted3: Boolean = false;

  showTokentobeLocked: any = 0;
  constructor(private _formBuilder: FormBuilder,
    private router: Router,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    private apiService: ApiService,) { }

  handleStep(e) {
    this.activeStep = e;
  }

  async ngOnInit() {
    this.buildCreateForm1();
    this.buildCreateForm2();
    this.buildCreateForm3();
    await this.checkConnected();
  }

  buildCreateForm1() {
    let { minCap, maxSoftCap, maxHardCap, maxBNB, minBNB, maxTokenPerBNBWallet, minTokenPerBNBWallet } = environment.validations;

    this.createForm1 = this._formBuilder.group({
      _token_address: ['', [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      _softCap: ['', [Validators.required, Validators.min(minCap), Validators.max(maxSoftCap)]],
      _hardCap: ['', [Validators.required, Validators.min(minCap), Validators.max(maxHardCap)]],
      _max_allowed: ['', [Validators.required, Validators.min(minBNB), Validators.max(maxBNB)]],
      _min_allowed: ['', [Validators.required, Validators.min(minBNB), Validators.max(maxBNB)]],
      _tokenAmount: ['', [Validators.required, Validators.min(minTokenPerBNBWallet), Validators.max(maxTokenPerBNBWallet)]]
    });
  }
  buildCreateForm2() {
    let { minOne, maxHundread, maxTokenPerBNB } = environment.validations;

    this.createForm2 = this._formBuilder.group({
      _tokenPerBNB: ['', [Validators.required, Validators.min(minOne), Validators.max(maxTokenPerBNB)]],
      _pancake_rate: ['0', [Validators.required, Validators.min(minOne), Validators.max(98)]],
      _lock_duration: ['', [Validators.required, Validators.min(60)]],
      _date: ['', [Validators.required]],
    });
  }
  buildCreateForm3() {

    this.createForm3 = this._formBuilder.group({
      _projectName: ['', [Validators.required, Validators.maxLength(64)]],
      _tokenName: ['', [Validators.required, , Validators.maxLength(64)]],
      _website: ['', [Validators.required, Validators.pattern(/^(http|https):\/\//)]],
      _tokenLogo: ['', []],
      _telegramLink: ['', [Validators.required, Validators.pattern(/^(http|https):\/\//)]],
      _twitterLink: ['', [Validators.required, Validators.pattern(/^(http|https):\/\//)]],
      _discordLink: ['', [Validators.required, Validators.pattern(/^(http|https):\/\//)]],
      _projectInfo: ['', [Validators.required, , Validators.maxLength(300)]],
    });
  }

  async checkConnected() {

    this.showObj.userAccount = await this.apiService.export();

    if (this.showObj.userAccount == undefined || !this.showObj.userAccount.length) {
      this.isLogin = false;
    } else {
      // put the metamask code.
      this.isLogin = true;
      this.wallet = 'Metamask';

      this.FRIDGEInstance = await this.apiService.exportInstance(environment.CVRToken, environment.CVRABI);
      this.FACORYInstance = await this.apiService.exportInstance(environment.FACTORYContract, environment.FACTORYABI);

      if (this.FRIDGEInstance && this.FRIDGEInstance != undefined) {
        await this.balanceOf(this.FRIDGEInstance, this.showObj.userAccount, this.apiService);
      }
    }

  }


  // for balance GET
  async balanceOf(contractInstance, walletAddress, service) {
    service.getBalance(contractInstance, walletAddress).then((data: any) => {
      if (data && data > 0) {
        this.showObj.FRIDGEBalance = (parseFloat(data)).toFixed(4);

      }
    }).catch((er) => {
      // err code
    });
  }

  setValidatorForHardCap(e) {
    const form = this.createForm1;
    if (e.target.value) {
      form.get('_hardCap').clearValidators();

      form.get('_hardCap').setValidators([Validators.required, Validators.min(parseInt(e.target.value) + 1), Validators.max(environment.validations.maxHardCap)]);
      form.get('_hardCap').updateValueAndValidity();
    } else {
      form.get('_hardCap').clearValidators();

      form.get('_hardCap').setValidators([Validators.required, Validators.min(environment.validations.minCap), Validators.max(environment.validations.maxHardCap)]);
      form.get('_hardCap').updateValueAndValidity();
    }

  }

  onSelectDocument(event) {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.match(/\.(jpeg|jpg|png|)$/)) {

        const formData = event.target.files[0];
        let uploadType = 'image';
        this.spinner.show();
        this.apiService.uploadData(uploadType, formData).subscribe((data) => {
          this.spinner.hide();
          if (data['success']) {
            this.imageURL = data['data']
            // this.createForm3.patchValue({ _tokenLogo: data['data'] });
          } else {
            this.toaster.error(data['message']);
          }
        }, (error) => {
          this.spinner.hide();
        });


      } else {
        this.toaster.error('The file you are trying to upload is not in supported format, please try again');
      }
    }
  }

  async onClickSubmit1() {
    this.spinner.show();

    if (this.isLogin) {
      this.submitted1 = true;

      if (this.createForm1.invalid) {
        this.spinner.hide();
        return;
      } else {
        let percentageBaL = ((this.createForm1.value._tokenAmount).toFixed(4) * 0.05) / 100;
        // minimum  FRIDGE check

        if (this.showObj.FRIDGEBalance >= percentageBaL) {

          let result: any = this.createForm1.value;

          if (parseFloat(result._softCap) < parseFloat(result._hardCap)) {

            if (parseFloat(result._min_allowed) < parseFloat(result._max_allowed)) {

              if (parseFloat(result._max_allowed) <= parseFloat(result._hardCap)) {
                this.spinner.hide();
                this.toaster.success('Step-1 completed successfully.');
                this.handleStep(2);

                this.submitted1 = false;
              } else {
                this.spinner.hide();
                this.toaster.warning('Max BNB per wallet should be less then or equal to hardcap !', 'Attention ')

              }

            } else {
              this.spinner.hide();
              this.toaster.error('Minimum BNB(per wallet) should be less then maximum BNB(per wallet).')
            }

          } else {
            this.spinner.hide();
            this.toaster.error('Softcap should be less then Hardcap.')
          }
        } else {
          this.spinner.hide();
          this.toaster.warning('You will require 0.05% $FRIDGE tokens of total Presale tokens !', 'Attention ')

        }
      }
    } else {
      this.spinner.hide();
      this.toaster.info('Connect First.')
    }


  }

  async onClickSubmit2() {

    this.spinner.show()

    if (this.isLogin) {
      this.submitted2 = true;
      let result: any = this.createForm2.value;
      let result1: any = this.createForm1.value;
      if (this.createForm2.invalid) {
        this.spinner.hide();
        return;
      } else {

        if (result['_date'][0] == null || result['_date'][1] == null) {
          this.spinner.hide();
          this.toaster.info('Please Select Valid Dates.');
        } else {
          if (result['_date'][0] == result['_date'][1]) {
            this.spinner.hide();
            this.toaster.error('EndDate should be greater then start date.');
          } else {
            let instance = await this.apiService.exportInstance(result1._token_address, environment.commanERCABI);

            if (instance) {

              let balance: any = 0;
              let allowance: any = 0;

              await this.apiService.getBalance(instance, this.showObj.userAccount).then(async (data: any) => {
                if (data && data > 0) {
                  balance = (parseFloat(data)).toFixed(4);

                  await this.apiService.allowance(instance, this.showObj.userAccount, environment.FACTORYContract).then((data: any) => {
                    if (data && data > 0) {
                      allowance = (parseFloat(data)).toFixed(4);

                    }
                  });

                }
              });

              // let tokenAMt = parseFloat(result1._tokenAmount) + (parseFloat(result1._hardCap) * result._tokenPerBNB);

              let a = parseFloat(result1._tokenAmount);
              let b = (parseFloat(result1._hardCap) * (parseFloat(result._pancake_rate) / 100)) * parseFloat(result._tokenPerBNB);
              let c = parseFloat(result1._tokenAmount) / 100;
              let tokenAMt = a + b + c;
              console.log('--------------------a', a);
              console.log('--------------------b', b);
              console.log('--------------------c', c);
              if (allowance >= tokenAMt && balance >= tokenAMt) {
                this.spinner.hide();
                this.submitted2 = false;

                result['_start_date'] = new Date(result['_date'][0]).getTime() / 1000;
                result['_end_date'] = new Date(result['_date'][1]).getTime() / 1000;

                this.toaster.success('Step-2 completed successfully.');

                // if success then
                this.handleStep(3);

              } else {


                if (balance > tokenAMt) {
                  await this.apiService.approve(instance, environment.FACTORYContract, balance, this.showObj.userAccount).then((resApprove) => {
                    this.spinner.hide();

                    if (resApprove) {
                      this.spinner.hide();
                      this.toaster.success('Tokens approved successfully.');
                    }
                  }).catch((er) => {
                    if (er && er.code) {
                      this.spinner.hide();
                      this.toaster.error(er.message)
                    }
                  });

                } else {
                  this.spinner.hide()

                  this.toaster.error("You don't have enough presale tokens to launch campaign")
                }


              }


            } else {
              this.spinner.hide();
              this.toaster.info('There is some issue with Token Address');
            }




          }
        }

      }
    } else {
      this.spinner.hide();
      this.toaster.info('Connect First.')
    }

  }

  async onClickSubmit3() {
    this.spinner.show();

    if (this.isLogin) {
      this.submitted3 = true;
      if (this.imageURL && this.imageURL != '') {

        if (this.createForm3.invalid) {
          this.spinner.hide();
          return;
        } else {
          let result1: any = this.createForm1.value;
          let result2: any = this.createForm2.value;
          let result3: any = this.createForm3.value;

          let fd = {
            //1 Array
            _softCap: result1._softCap ? result1._softCap : 0,
            _hardCap: result1._hardCap ? result1._hardCap : 0,
            _min_allowed: result1._min_allowed ? result1._min_allowed : 0,
            _max_allowed: result1._max_allowed ? result1._max_allowed : 0,
            _token_address: result1._token_address ? result1._token_address : 0,
            _tokenAmount: result1._tokenAmount ? result1._tokenAmount : 0,

            //2 
            _start_date: result2._start_date ? result2._start_date : 0,
            _end_date: result2._end_date ? result2._end_date : 0,
            _lock_duration: result2._lock_duration ? result2._lock_duration : 0,
            _tokenPerBNB: result2._tokenPerBNB ? result2._tokenPerBNB : 0,
            _pancake_rate: result2._pancake_rate ? parseInt(result2._pancake_rate) * 10 : 0,

            _projectName: result3._projectName ? result3._projectName : 0,
            _tokenName: result3._tokenName ? result3._tokenName : 0,
            _website: result3._website ? result3._website : 0,
            _tokenLogo: this.imageURL ? this.imageURL : 0,
            _telegramLink: result3._telegramLink ? result3._telegramLink : 0,
            _twitterLink: result3._twitterLink ? result3._twitterLink : 0,
            _discordLink: result3._discordLink ? result3._discordLink : 0,
            _projectInfo: result3._projectInfo ? result3._projectInfo : 0,
            _walletAddress: this.showObj.userAccount ? this.showObj.userAccount : 0,

            _pool_rate: result2._tokenPerBNB ? result2._tokenPerBNB : 0,
            _rnAMM: 100,

          };

          await this.apiService.createCampaign(this.FACORYInstance, this.showObj.userAccount, fd).then((resApprove: any) => {
            if (resApprove) {
              this.spinner.hide();
              this.toaster.success('Campaign created successfully.');
              this.router.navigate(['/dashboard/index']);
            } else {
              this.spinner.hide();

            }
          }).catch((er) => {
            if (er && er.code) {
              this.spinner.hide();
              this.toaster.error(er.message)
            }
          });


        }

      } else {
        this.spinner.hide();
        this.toaster.info('Please select token icon/logo')
      }
    } else {
      this.spinner.hide();
      this.toaster.info('Connect First.')
    }

  }

  onClickMinus() {

    let a = parseInt(this.createForm2.value._pancake_rate) - 1;
    if (a > 0) {
      this.createForm2.patchValue({ '_pancake_rate': a })

      this.onkeyUpPancake({ target: { value: a } });
    }

  }

  onClickPlus() {

    let a = parseInt(this.createForm2.value._pancake_rate) + 1;

    if (a > 0) {
      this.createForm2.patchValue({ '_pancake_rate': a })
      this.onkeyUpPancake({ target: { value: a } });
    }
  }

  onkeyUpPancake(e) {

    if (e.target.value) {
      this.showTokentobeLocked = (parseFloat(e.target.value) * parseInt(this.createForm1.value['_tokenAmount'])) / 100;

    } else {
      this.showTokentobeLocked = 0;
    }

  }

  onClickRefresh() {
    window.location.reload();
  }
}
