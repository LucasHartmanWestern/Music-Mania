import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from "@auth0/angular-jwt";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthenticationService } from "../../core/services/authentication/authentication.service";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-account-verify',
  templateUrl: './account-verify.component.html',
  styleUrls: ['./account-verify.component.scss']
})
export class AccountVerifyComponent implements OnInit {

  helper = new JwtHelperService();
  token: string | null = null;
  error: string = '';

  constructor(private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
  }

  validateAccount(event: any): void {
    event.preventDefault();
    let jwt = this.helper.decodeToken(this.token || undefined);
    console.log(jwt);

    this.spinner.show();
    this.authenticationService.login(jwt.username, jwt.password, false, undefined, true).subscribe(res => {

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
