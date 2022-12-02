import { Component, OnInit } from '@angular/core';
import { Artist, Track } from "../../core/constants/common.enum";
import { MusicService } from "../../core/services/music/music.service";

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  previewTrack: Track | any = null;
  previewArtist: Artist | any = null;

  constructor(private musicService: MusicService) { }

  // Populate preview when data is emitted by track-display
  ngOnInit(): void {
    // Run when preview is set
    this.musicService.previewSelection$.subscribe((val: {preview: Track | Artist, type: string}) => {
      // Handle when track preview is set
      if(val?.type == "track"){
        this.previewArtist = null;
        this.previewTrack = val.preview;
      } else {
        this.previewTrack = null;
        this.previewArtist = val.preview;
      }
    });
  }

}
