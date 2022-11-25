import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PasswordResetComponent } from "./login/password-reset/password-reset.component";
import { MainComponent } from "./main/main.component";
import { AccountVerifyComponent } from "./login/account-verify/account-verify.component";

const routes: Routes = [{
    path: 'login/reset/:token', component: PasswordResetComponent
  }, {
    path: 'login/verify/:token', component: AccountVerifyComponent
  }, {
    path: '', component: MainComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
