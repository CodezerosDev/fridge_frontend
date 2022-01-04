import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TimelineMax, gsap } from 'gsap';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  menu = new TimelineMax({ paused: true });
  constructor(private router: Router,   private spinner: NgxSpinnerService,) {
  }
  
  ngOnInit() {
    this.animation();
  }

  animation() {
    if (window.matchMedia('(min-width:1200px)')) {
      this.menu.to('.fridge-door', 0.3, { width: '0', right: 0 }, 0);
      this.menu.to('.fridge-open', 0.3, { scale: 8 }, 0.3).then(() => {
        this.spinner.show();
        this.router.navigate(['/dashboard/index']);
      });
    }
    if (window.matchMedia('(max-width:1199px)')) {
      this.menu.to('.fridge-door', 0.3, { width: '0', right: 0 }, 0);
      this.menu.to('.fridge-open', 0.3, { scale: 10 }, 0.3).then(() => {
        this.spinner.show();
        this.router.navigate(['/dashboard/index']);
      });
    }
    const maxRot = 10;
    const setRot = gsap.quickSetter('.coins', 'translateX', 'px');
    const setRot2 = gsap.quickSetter('.coins2', 'translateX', 'px');

    gsap.set('.coins', { transformOrigin: 'center center' });
    gsap.set('.coins2', { transformOrigin: 'center center' });

    let getPercent;
    function resize() {
      getPercent = gsap.utils.mapRange(0, innerWidth, -1, 1);
    }

    window.addEventListener('mousemove', (e) => {
      const percent = getPercent(e.pageX);
      setRot(-percent * maxRot);
      setRot2(percent * maxRot);
    });

    window.addEventListener('resize', resize);
    resize();
  }
  launch() {
    this.menu.play();
  }
}
