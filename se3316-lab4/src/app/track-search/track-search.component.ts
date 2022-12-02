import { Component, OnInit } from '@angular/core';
import { MusicService } from "../core/services/music/music.service";

@Component({
  selector: 'app-track-search',
  templateUrl: './track-search.component.html',
  styleUrls: ['./track-search.component.scss']
})
export class TrackSearchComponent implements OnInit {

  constructor(private musicService: MusicService) { }

  ngOnInit(): void {
  }

  // Emit search criteria for track-display component to use
  search(event: any, trackTitle: string, artistTitle: string, albumTitle: string): void {
    event.preventDefault();
    this.musicService.searchParams$.next({trackTitle: trackTitle, artistTitle: artistTitle, albumTitle: albumTitle});
  }

}
