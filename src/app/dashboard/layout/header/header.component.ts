import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isNavbarCollapsed: any = true;

  isNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }



  id: any;
  isLogin: any = false;
  wallet: any;

  showObj: any = {
    userAccount: '',
    chainId: '',
    networkName: ''
  };
  constructor(private router: Router,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService,
  ) {

    // this.id = this._route.snapshot.params['id'];
  }

  async ngOnInit() {
    await this.checkConnected()
  }

  async checkConnected() {

    this.showObj.userAccount = await this.apiService.export();

    if (this.showObj.userAccount == undefined || !this.showObj.userAccount.length) {
      this.isLogin = false;
    } else {
      // put the metamask code.
      this.isLogin = true;
      this.wallet = 'Metamask';

      // this.metaMaskConnected();
    }
    this.metaMaskConnected();

  }


  async metaMaskConnected() {
    this.getNetworkName();

  }


  async getNetworkName() {
    this.showObj.networkName = await this.apiService.getNetworkName();
  }




  connectToMetaMask() {

    this.apiService.connect().then((data) => {
      this.toaster.success('User Connected Successfully');
      // if (this.router.url) {
        // this.router.navigate(['/' +this.router.url.split('/')[0] +'/'+ this.router.url.split('/')[1] ]).then(() => {
        //   this.onClickRefresh();
        // });
      // }

    }).catch((er) => {

      if (er && er.code) {
        this.toaster.error(er.message);
      }
    })
  }



  onClickRefresh() {
    window.location.reload();
  }

}
