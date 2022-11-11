import { Component, OnInit } from '@angular/core';
import { MusicService } from "../core/services/music/music.service";
import { Artist, Track } from "../core/constants/common.enum";

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  previewTrack: any = null;
  previewArtist: any = null;

  constructor(private musicService: MusicService) { }

  ngOnInit(): void {

    // Run when preview is set
    this.musicService.previewSelection$.subscribe((val: {preview: Track | Artist, type: string}) => {
      // Handle when track preview is set
      if(val?.type == "track"){
        this.previewTrack = val.preview;
      } else {
        this.previewArtist = val.preview;
      }
    });
  }

}
