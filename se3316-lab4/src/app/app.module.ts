import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TrackSearchComponent } from './track-search/track-search.component';
import { TrackDisplayComponent } from './track-display/track-display.component';
import { PlaylistComponent } from './sidebar/playlist/playlist.component';
import { PlaylistSelectorComponent } from './modals/playlist-selector/playlist-selector.component';
import { HttpClientModule } from "@angular/common/http";
import { NgbActiveModal, NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SidebarComponent } from './sidebar/sidebar.component';
import { PreviewComponent } from './sidebar/preview/preview.component';

@NgModule({
  declarations: [
    AppComponent,
    TrackSearchComponent,
    TrackDisplayComponent,
    PlaylistComponent,
    PlaylistSelectorComponent,
    SidebarComponent,
    PreviewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    NgxSpinnerModule,
    BrowserAnimationsModule
  ],
  providers: [NgbActiveModal, NgbModal, TrackDisplayComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
