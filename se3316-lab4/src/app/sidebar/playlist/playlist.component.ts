import { Component, OnInit } from '@angular/core';
import { MusicService } from "../../core/services/music/music.service";

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  previewAvailable: boolean = false;

  constructor(private musicService: MusicService) { }

  ngOnInit(): void {
    // Run when preview is set
    this.musicService.previewSelection$.subscribe((val: {preview: any, type: string}) => {
      // Handle when track preview is set
      if (val.preview) this.previewAvailable = true;
      else this.previewAvailable = false;
    });
  }

  home(): void {
    this.musicService.previewSelection$.next({preview: null, type: ''});
    this.musicService.searchParams$.next({trackTitle: '', artistTitle: '', albumTitle: ''});
  }

}
