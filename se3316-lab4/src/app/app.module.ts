import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TrackSearchComponent } from './track-search/track-search.component';
import { TrackDisplayComponent } from './track-display/track-display.component';
import { PlaylistComponent } from './sidebar/playlist/playlist.component';
import { PlaylistSelectorComponent } from './modals/playlist-selector/playlist-selector.component';
import { HttpClientModule } from "@angular/common/http";
import { NgbActiveModal, NgbModal, NgbModule, NgbPopover } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SidebarComponent } from './sidebar/sidebar.component';
import { PreviewComponent } from './sidebar/preview/preview.component';
import { NgClass } from "@angular/common";
import { LoginComponent } from './login/login.component';
import { ReviewsComponent } from './modals/reviews/reviews.component';
import { UsersComponent } from './modals/users/users.component';
import { PasswordResetComponent } from './login/password-reset/password-reset.component';
import { MainComponent } from './main/main.component';
import { AccountVerifyComponent } from './login/account-verify/account-verify.component';
import { ConfirmComponent } from './modals/confirm/confirm.component';
import { PolicyComponent } from './modals/policy/policy.component';

@NgModule({
  declarations: [
    AppComponent,
    TrackSearchComponent,
    TrackDisplayComponent,
    PlaylistComponent,
    PlaylistSelectorComponent,
    SidebarComponent,
    PreviewComponent,
    LoginComponent,
    ReviewsComponent,
    UsersComponent,
    PasswordResetComponent,
    MainComponent,
    AccountVerifyComponent,
    ConfirmComponent,
    PolicyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    NgxSpinnerModule,
    BrowserAnimationsModule
  ],
  providers: [NgbActiveModal, NgbModal, TrackDisplayComponent, NgbPopover, NgClass],
  bootstrap: [AppComponent]
})
export class AppModule { }
