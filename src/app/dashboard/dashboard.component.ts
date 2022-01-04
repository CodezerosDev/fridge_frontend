import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
  onActivate(event) {
    window.scroll(0, 0);
  }
}
