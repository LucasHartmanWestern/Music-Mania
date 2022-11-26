import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Credentials } from "../core/constants/common.enum";
import { AuthenticationService } from "../core/services/authentication/authentication.service";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @Output() credentials = new EventEmitter<Credentials>();
  error: string = '';
  formType: string = 'Login';
  forgotPw: boolean = false;
  resendValid: boolean = false;
  loginIssue: boolean = false;

  constructor(private authenticationService: AuthenticationService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
  }

  authenticate(username: string, password: string): void {

    if (!username || !password) this.error = "Please enter both a username and password";
    else {
      // Authenticate the user
      this.spinner.show();
      this.authenticationService.login(username, password).subscribe(res => {

        if (res?.jwt) {
          this.credentials.emit({jwt: res?.jwt});
          localStorage.setItem('token', res?.jwt);
        }

        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        if (error === "Invalid Credentials") this.forgotPw = true;
        if (error === "Please verify your account to continue") this.resendValid = true;
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

        if (res?.result === 'Success') {
          this.formType = 'Login';
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

  resendEmail(event: any, email: string): void {
    event.preventDefault();
    this.loginIssue = false;

    if (this.resendValid) {
      this.resendValid = false;
      this.error = 'Email to validate account resent';
      this.spinner.show();
      this.authenticationService.resendValidation(email).subscribe(res => {
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this.error = error;
      });
    }
    if (this.forgotPw) {
      this.forgotPw = false;
      this.error = 'Email to reset password sent';
      this.spinner.show();
      this.authenticationService.resetPassword(email).subscribe(res => {
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
    this.authenticationService.continueAsGuest().subscribe(res => {
      this.spinner.hide();
      this.credentials.emit({jwt: res.jwt});
      localStorage.setItem('token', res.jwt);
    }, error => {
      this.spinner.hide();
      this.error = error;
    });
  }

}
