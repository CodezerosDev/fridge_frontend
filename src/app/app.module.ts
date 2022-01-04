import { BrowserModule } from '@angular/platform-browser';
import {  LOCALE_ID, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { ElbHealthComponent } from './elb-health/elb-health.component';

@NgModule({
  declarations: [AppComponent, ElbHealthComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      enableHtml: true,
    }),
  ],
  providers: [ { provide: OWL_DATE_TIME_LOCALE, useValue: 'en-GB' }, { provide: LOCALE_ID, useValue: 'en-GB' }    
],
  bootstrap: [AppComponent],
})
export class AppModule {}
