import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { LayoutModule } from './layout/layout.module';
import { IndexComponent } from './index/index.component';
import { BuyComponent } from './buy/buy.component';
import { CreateComponent } from './create/create.component';
import { VoteComponent } from './vote/vote.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PoolComponent } from './pool/pool.component';
import { NewBuyComponent } from './new-buy/new-buy.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'index',
        component: IndexComponent,
      },
      {
        path: 'buy',
        component: BuyComponent,
      },
      {
        path: 'new-buy',
        component: NewBuyComponent,
      },
      {
        path: 'pool',
        component: PoolComponent,
      },
      {
        path: 'create',
        component: CreateComponent,
      },
      {
        path: 'vote',
        component: VoteComponent,
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    LayoutModule,
    NgbModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,

  ],
  exports: [RouterModule],
  providers: [ { provide: OWL_DATE_TIME_LOCALE, useValue: 'en-GB' }, { provide: LOCALE_ID, useValue: 'en-GB' } ],
  declarations: [
    DashboardComponent,
    IndexComponent,
    BuyComponent,
    CreateComponent,
    VoteComponent,
    PoolComponent,
    NewBuyComponent
  ],
})
export class DashboardModule {}
