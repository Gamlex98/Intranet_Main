import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { navbarData } from './nav-data';
import { INavbarData, fadeInOut } from './helper';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './nav-var.component.html',
  styleUrls: ['./nav-var.component.scss'],
  animations: [
    fadeInOut,
    trigger('rotate', [
      transition(':enter', [
        animate('1000ms', 
          keyframes([
            style({transform: 'rotate(0deg)', offset: '0'}),
            style({transform: 'rotate(2turn)', offset: '1'})
          ])
        )
      ])
    ])
  ]
})
export class NavVarComponent implements OnInit{

  @Output() onToggleSidenav: EventEmitter<SideNavToggle> = new EventEmitter();
  
  collapsed = true;
  screenWidth = 0;
  navData= navbarData;
  multiple: boolean = false;

  constructor(public router:Router) {}

  @HostListener('window:resize', ['$event'])

  ngOnInit(): void {
    this.screenWidth= window.innerWidth;
    if (this.screenWidth <= 768) {
      this.collapsed= false;
      this.onToggleSidenav.emit({collapsed:this.collapsed, screenWidth: this.screenWidth});
    } else {
      this.collapsed= true;
      this.onToggleSidenav.emit({collapsed:this.collapsed, screenWidth: this.screenWidth});
    }
  }

  /* onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if(this.screenWidth <= 768 ) {
      this.collapsed = false;
      this.onToggleSidenav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
    }
  } */

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSidenav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }
  closeSidenav():void {
    this.collapsed= false;
    this.onToggleSidenav.emit({collapsed:this.collapsed, screenWidth: this.screenWidth});
  }

  handleClick(item: INavbarData): void {
    this.shrinkItems(item);
    item.expanded = !item.expanded
  }

  getActiveClass(data: INavbarData): string {
  if (data.routeLink && this.router.url.includes(data.routeLink)) {
    return 'active';
  }
  return '';
  }

  shrinkItems(item: INavbarData): void {
    if (!this.multiple) {
      for(let modelItem of this.navData) {
        if (item !== modelItem && modelItem.expanded) {
          modelItem.expanded = false;
        }
      }
    }
  }
}
