import { NgModule } from "@angular/core";
import { HeaderComponent ,Divide18Pipe , NumberDatePipe ,TimerConvertPipe} from "./index";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Routes, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        NgbModule
    ],
    declarations: [
        HeaderComponent,
        Divide18Pipe,
        NumberDatePipe,
        TimerConvertPipe
    ],
    providers: [    Divide18Pipe,NumberDatePipe ,TimerConvertPipe
    ],
    bootstrap: [HeaderComponent],
    exports: [
        HeaderComponent, RouterModule,Divide18Pipe,NumberDatePipe,TimerConvertPipe
    ],
})
export class LayoutModule {
}



