import { Component, OnInit } from '@angular/core';
import {Credentials} from "../core/constants/common.enum";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  credentials: Credentials = {
    jwt: localStorage.getItem('token')
  };

  constructor() { }

  ngOnInit(): void {
  }

}
