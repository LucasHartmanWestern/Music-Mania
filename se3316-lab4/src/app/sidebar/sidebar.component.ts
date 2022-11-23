import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { Credentials } from "../core/constants/common.enum";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Output() logout = new EventEmitter<Credentials>();

  constructor() { }

  ngOnInit(): void {
  }

  logoutOfApp(): void {
    this.logout.emit({jwt: null});
  }

}
