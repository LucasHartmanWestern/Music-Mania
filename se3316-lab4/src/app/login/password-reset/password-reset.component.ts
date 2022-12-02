import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { NgxSpinnerService } from "ngx-spinner";
import { AuthenticationService } from "../../core/services/authentication/authentication.service";

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  helper = new JwtHelperService();
  token: string | null = null;
  error: string = '';

  constructor(private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
  }

  // Reset password of user
  resetPassword(event: any, password: string, confirm: string): void {
    event.preventDefault();
    let jwt = this.helper.decodeToken(this.token || undefined);


    if (!password || !confirm || (password !== confirm)) this.error = "Please enter matching passwords";
    else {
      // Authenticate the user
      this.spinner.show();
      this.authenticationService.login(jwt.username, jwt.password, true, password).subscribe(res => {

        if (res?.jwt) {
          localStorage.setItem('token', res?.jwt);
          this.router.navigateByUrl('');
        }

        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this.error = error;
      });
    }
  }

}
