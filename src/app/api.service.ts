import { Injectable } from '@angular/core';
import Web3 from 'web3';

import { HttpHeaders, HttpClient } from '@angular/common/http';

import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { env } from 'process';
import { map } from 'rxjs/operators';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  userAccount: any;
  URL: any = environment.URL;

  constructor(private route: ActivatedRoute, private http: HttpClient, private toaster: ToastrService, private router: Router,) {

    if (window.ethereum) {

      window.web3 = new Web3(Web3.givenProvider);
      // window.web3 = new Web3(window.Web3.givenProvider);

      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length) {
          if (this.userAccount != accounts[0]) {

            this.userAccount = accounts[0];
            window.location.reload();
          }

        }
        // window.location.reload();
      });

    }
    // Legacy dapp browsers...
    else if (window.web3) {

      // commented for future use
    }
    // Non-dapp browsers...
    else {
      window.web3 = new Web3(environment.mainnetBSC);
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

  }

  getNetworkName() {
    if (window.ethereum && window.ethereum.chainId) {

      console.log(window.ethereum.chainId)
      if (window.ethereum.chainId == "0x1") {
        return environment.main;
      }
      if (window.ethereum.chainId == "0x3") {
        return environment.rops;
      }
      if (window.ethereum.chainId == "0x4") {
        return environment.rinkeby;
      }
      if (window.ethereum.chainId == "0x5") {
        return environment.Goerli;
      }
      if (window.ethereum.chainId == "0x2a") {
        return environment.Kovan;
      }
      if (window.ethereum.chainId == '0x61') {
        return environment.bscTestnet;
      }
      if (window.ethereum.chainId == '0x38') {
        return environment.bscMainnet;
      }


    }
  }

  connect() {
    if (window.ethereum) {
      // commented for future use
      return new Promise((resolve, reject) => {

        let temp = window.ethereum.enable();
        // web3.eth.accounts.create();
        if (temp) {
          resolve(temp)
        } else {
          reject('err');
        }

      })
    }
  }

  // --dn
  async exportInstance(SCAddress, ABI) {
    return await new window.web3.eth.Contract(ABI, SCAddress);
  }

  // --dn
  async export() {
    if (window.web3) {
      return new Promise((resolve, reject) => {
        window.web3.eth.getAccounts((error, result) => {

          // just 1 min jo
          if (error != null) {
            resolve([]);
          }

          if (result == undefined || result.length == 0) {
            // alert("No account found! Make sure the Ethereum client is configured properly.");
            resolve([]);
          } else {

            let account = result[0];

            window.web3.eth.defaultAccount = account;

            resolve(account)
          }
        })
      })
    } else {
      // this.toaster.error('No account found! Make sure the Ethereum client is configured properly. ')
    }

  }

  getBalance(contractInstance, userWalletAccount) {
    return new Promise(async (resolve, reject) => {
      if (!userWalletAccount) {
        console.log('Metamask/Wallet connection failed.');
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.balanceOf(userWalletAccount).call({
        from: userWalletAccount
      });

      if (result) {
        result = await Web3.utils.fromWei(`${result}`);
        resolve(result);
      } else {
        reject('err');
      }

    });

  }

  getCampaignAddress(contractInstance, walletAddress, tokenAdress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.tokenCampaign(tokenAdress).call({
        from: walletAddress
      });
      if (result) {
        resolve(result);
        console.log('----------address---', result)
      } else {
        reject(0);
      }

    });
  }


  allowance(contractInstance, walletAddress, contractAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.allowance(walletAddress, contractAddress).call({
        from: walletAddress
      });
      if (result) {
        result = Web3.utils.fromWei(`${result}`)
        resolve(result);
      } else {
        reject(0);
      }

    });
  }

  // --dn
  async approve(contractInstance, walletAddress, _balance, userAccount) {
    _balance = Web3.utils.toWei(`${_balance}`)

    return new Promise((resolve, reject) => {

      contractInstance.methods.approve(walletAddress, _balance).send({ from: userAccount }).then((data) => {
        if (data) {
          resolve(data);
        }
      }).catch((er) => {
        if (er) {
          reject(er);
        }
      })

    })
  }
  getHeaders() {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('access-control-allow-origin', '*');
    return headers;
  }


  async createCampaign(contractInstance, userAccount, obj) {


    let { _softCap, _hardCap, _min_allowed, _max_allowed, _token_address, _tokenAmount,
      _start_date, _end_date, _lock_duration, _tokenPerBNB, _pancake_rate,
      _projectName, _tokenName, _website, _tokenLogo, _telegramLink, _twitterLink, _discordLink, _projectInfo,
      _walletAddress, _pool_rate, _rnAMM, } = obj;
    const that = this;

    //------- 
    let _rate: any = parseFloat(_tokenAmount) / parseFloat(_hardCap);
    _rate = Web3.utils.toWei(`${_rate}`);
    // _rate = parseInt(_rate);
    // --- 1 step
    _min_allowed = Web3.utils.toWei(`${_min_allowed}`);
    _max_allowed = Web3.utils.toWei(`${_max_allowed}`);
    _softCap = Web3.utils.toWei(`${_softCap}`);
    _hardCap = Web3.utils.toWei(`${_hardCap}`);
    _token_address = Web3.utils.toChecksumAddress(`${_token_address}`);
    _tokenAmount = Web3.utils.toWei(`${_tokenAmount}`);

    // --- 2 step
    _start_date = parseInt(_start_date);
    _end_date = parseInt(_end_date);


    let array = [_softCap, _hardCap, _start_date, _end_date, _rate, _min_allowed, _max_allowed];

    let tempObj: any = {
      _softCap, _hardCap, _min_allowed, _max_allowed, _token_address, _tokenAmount,
      _start_date, _end_date, _lock_duration, _tokenPerBNB, _pancake_rate,
      _projectName, _tokenName, _website, _tokenLogo, _telegramLink, _twitterLink, _discordLink, _projectInfo,
      _walletAddress, _pool_rate, _rnAMM, _rate
    };

    _pool_rate = Web3.utils.toWei(`${_pool_rate}`);

    console.log('--------------array-----', array);
    console.log('--------------adress-----', _token_address, _pool_rate, _lock_duration, _pancake_rate, _rnAMM);
    return new Promise((resolve, reject) => {

      contractInstance.methods.createCampaign(array, _token_address, _pool_rate, _lock_duration, _pancake_rate).send({ from: userAccount })
        .
        // on('transactionHash', function (hash) {
        //   console.log('------tx----', hash);
        //   tempObj._transactionHash = hash;
        //   that.http.post(that.URL + '/api/create-Campain', tempObj, { headers: that.getHeaders() }).subscribe((tempAddData) => {
        //     console.log('------add----', tempAddData);
        //   });
        // })
        on('receipt', function (receipt) {
          console.log('------receipt----', receipt);
          tempObj._transactionHash = receipt['transactionHash'];
          that.http.post(that.URL + '/api/create-Campain', tempObj, { headers: that.getHeaders() }).subscribe((tempAddData) => {
            console.log('------add----', tempAddData);
          });
        })
        .then((data) => {
          if (data) {
            console.log('------last success ----', data);

            resolve(data);
          }
        }).catch((er) => {
          console.log('------er er ----', er);

          if (er) {
            reject(er);
          }
        })

    })
  }


  getCampainsData() {
    return this.http.post(this.URL + '/api/getCampains', {})
      .pipe(
        map((res: Response) => res)
      );
  }



  getActiveCampainsData() {
    return this.http.get(this.URL + '/api/getActiveCampaign', {})
      .pipe(
        map((res: Response) => res)
      );
  }

  getActiveCampainsDataByAddress(token_address) {
    return this.http.get(this.URL + '/api/campaign/' + token_address, {})
      .pipe(
        map((res: Response) => res)
      );
  }

  uploadData(type, d: any) {
    const fd = new FormData();

    fd.append('updDocs', d);
    fd.append('updType', type);

    return this.http.post(this.URL + '/api/uploadData', fd, { headers: this.getHeader() });
  }

  getHeader() {
    let headers = new HttpHeaders();
    return headers;
  }


  async buy(contractInstance, userAccount, amount1) {
    amount1 = Web3.utils.toWei(`${amount1}`)
    // amount2 = Web3.utils.toWei(`${amount2}`)
    console.log('-------------------------', contractInstance, userAccount, amount1)
    return new Promise((resolve, reject) => {

      contractInstance.methods.buyTokens().send({ from: userAccount, value: amount1 }).then((data) => {
        if (data) {
          resolve(data);
        }
      }).catch((er) => {
        if (er) {
          reject(er);
        }
      })

    })
  }


  collected(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.collected().call({
        from: walletAddress
      });
      if (result) {
        result = Web3.utils.fromWei(`${result}`)
        resolve(result);
      } else {
        reject(0);
      }

    });
  }


  async earned(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      let result = await contractInstance.methods.earned(walletAddress).call({ from: walletAddress })

      if (result) {
        resolve(result);
      } else {
        reject('err');
      }
    })
  }



  totalSupply(contractInstance, userWalletAccount) {
    return new Promise(async (resolve, reject) => {
      if (!userWalletAccount) {
        console.log('Metamask/Wallet connection failed.');
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.totalSupply().call({
        from: userWalletAccount
      });

      if (result) {
        resolve(result);
      } else {
        reject('err');
      }

    });

  }



  // --dn
  async stake(contractInstance, _balance, userAccount) {
    _balance = Web3.utils.toWei(`${_balance}`)

    return new Promise((resolve, reject) => {

      contractInstance.methods.stake(_balance).send({ from: userAccount }).then((data) => {
        if (data) {
          resolve(data);
        }
      }).catch((er) => {
        if (er) {
          reject(er);
        }
      })

    })
  }

  async withdraw(contractInstance, _balance, walletAddress) {
    _balance = Web3.utils.toWei(`${_balance}`)


    return new Promise((resolve, reject) => {

      contractInstance.methods.withdraw(_balance).send({ from: walletAddress }).then((data) => {
        if (data) {
          resolve(data);
        }
      }).catch((er) => {
        if (er) {
          reject(er);
        }
      })
    })
  }


  getReward(contractInstance, walletAddress, chainId) {

    return new Promise((resolve, reject) => {

      contractInstance.methods.getReward().send({ from: walletAddress }).then((data) => {
        if (data) {
          resolve(data);
        }
      }).catch((er) => {
        if (er) {
          reject(er);
        }
      })
    })
  }


  isLive(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.isLive().call({
        from: walletAddress
      });
      console.log('-------islive----------', result)

      if (result) {
        resolve(result);
      } else {
        reject(0);
      }

    });
  }

  failed(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.failed().call({
        from: walletAddress
      });
      if (result) {
        resolve(result);
      } else {
        reject(0);
      }

    });
  }

  factory_owner(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.factory_owner().call({
        from: walletAddress
      });
      if (result) {
        resolve(result);
      } else {
        reject('');
      }

    });
  }

  // 
  withdrawFunds(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.withdrawFunds().send({
        from: walletAddress
      });
      if (result) {
        resolve(result);
      } else {
        reject(0);
      }

    });
  }


  fridgeVAULT(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.fridgeVAULT().send({
        from: walletAddress
      });
      if (result) {
        resolve(result);
      } else {
        reject(result);
      }

    });
  }

  // 

  exit(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.exit().send({
        from: walletAddress
      });
      if (result) {
        resolve(result);
      } else {
        reject(result);
      }

    });
  }


  withdrawTokens(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.withdrawTokens().send({
        from: walletAddress
      });
      if (result) {
        resolve(result);
      } else {
        reject(result);
      }

    });
  }


  withDrawRemainingAssets(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.withDrawRemainingAssets().send({
        from: walletAddress
      });
      if (result) {
        resolve(result);
      } else {
        reject(result);
      }

    });
  }

  locked(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.locked().call({
        from: walletAddress
      });
      if (result) {
        resolve(result);
      } else {
        reject(result);
      }

    });
  }


  softCap(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.softCap().call({
        from: walletAddress
      });
      if (result) {
        resolve(result / environment.divideValue);
      } else {
        reject(0);
      }

    });
  }

  hardCap(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.hardCap().call({
        from: walletAddress
      });
      if (result) {
        resolve(result / environment.divideValue);
      } else {
        reject(0);
      }

    });
  }

  participant(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.getGivenAmount(walletAddress).call({
        from: walletAddress
      });
      if (result) {
        resolve(result / environment.divideValue);
      } else {
        reject(0);
      }

    });
  }



  doRefund(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.doRefund().call({
        from: walletAddress
      });

      console.log('-------------------do refund .------', result)
      if (result) {
        resolve(result);
      } else {
        reject(0);
      }

    });
  }

  owner(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.owner().call({
        from: walletAddress
      });

      if (result) {
        resolve(result);
      } else {
        reject(0);
      }

    });
  }

  end_date(contractInstance, walletAddress) {
    return new Promise(async (resolve, reject) => {
      if (!walletAddress) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.end_date().call({
        from: walletAddress
      });

      if (result) {
        resolve(result);
      } else {
        reject(0);
      }

    });
  }


}
