import { Component } from '@angular/core';
import { Credentials } from "./core/constants/common.enum";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'se3316-lab4';
  credentials: Credentials = {
    user: localStorage.getItem('credUser'),
    pass: localStorage.getItem('credPass'),
    access_level: parseInt(localStorage.getItem('credAccess') || '')
  };
}
