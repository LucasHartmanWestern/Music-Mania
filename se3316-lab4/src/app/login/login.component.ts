import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Credentials } from "../core/constants/common.enum";
import { AuthenticationService } from "../core/services/authentication/authentication.service";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @Output() credentials = new EventEmitter<Credentials>();
  error: string = '';
  formType: string = 'Login';

  constructor(private authenticationService: AuthenticationService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
  }

  authenticate(username: string, password: string): void {

    if (!username || !password) this.error = "Please enter both a username and password";
    else {
      // Authenticate the user
      this.spinner.show();
      this.authenticationService.login(username, password).subscribe(res => {

        if (res?.access_level) {
          this.credentials.emit({user: username, pass: password, access_level: res?.access_level});
          localStorage.setItem('credUser', username);
          localStorage.setItem('credPass', password);
          localStorage.setItem('credAccess', res?.access_level?.toString() || '');
        }

        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this.error = error;
      });
    }
  }

  createAccount(username: string, email: string, password: string, confirm: string): void {

    if (password !== confirm) this.error = "Your password does not match your confirmation";
    else if (!username || !password) this.error = "Please enter both a username and password";
    else {
      // Create the user
      this.spinner.show();
      this.authenticationService.createAccount(username, email, password).subscribe(res => {

        if (res.access_level) {
          this.credentials.emit({user: username, pass: password, access_level: res?.access_level});
          localStorage.setItem('credUser', username);
          localStorage.setItem('credPass', password);
        }
        else {
          this.error = "Something went wrong, please try again";
        }

        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this.error = error;
      });
    }
  }

  continueAsGuest(): void {
    // Assign guest account
    this.spinner.show();

    this.credentials.emit({user: 'guest', pass: 'pass', access_level: 0});
    localStorage.setItem('credUser', 'guest');
    localStorage.setItem('credPass', 'pass');
    localStorage.setItem('credAccess', '0');

    this.spinner.hide();


  }

}
