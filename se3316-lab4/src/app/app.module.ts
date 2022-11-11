import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TrackSearchComponent } from './track-search/track-search.component';
import { TrackDisplayComponent } from './track-display/track-display.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { PlaylistSelectorComponent } from './modals/playlist-selector/playlist-selector.component';
import { HttpClientModule } from "@angular/common/http";
import { NgbActiveModal, NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@NgModule({
  declarations: [
    AppComponent,
    TrackSearchComponent,
    TrackDisplayComponent,
    PlaylistComponent,
    PlaylistSelectorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    NgxSpinnerModule,
    BrowserAnimationsModule
  ],
  providers: [NgbActiveModal, NgbModal],
  bootstrap: [AppComponent]
})
export class AppModule { }
