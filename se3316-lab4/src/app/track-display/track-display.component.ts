import { Component, OnInit } from '@angular/core';
import { MusicService } from "../core/services/music/music.service";
import {Artist, Genre, Playlist, Track} from "../core/constants/common.enum";
import { PlaylistSelectorComponent } from "../modals/playlist-selector/playlist-selector.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-track-display',
  templateUrl: './track-display.component.html',
  styleUrls: ['./track-display.component.scss']
})
export class TrackDisplayComponent implements OnInit {

  genres: Genre[] = [];
  tracks: Track[] = [];
  artists: Artist[] = [];
  lists: Playlist[] = [];

  sortTracking = {index: -1, sort: 'ASC'};

  constructor(private musicService: MusicService, private modalService: NgbModal, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.getGenres();

    // Wait for search parameters
    this.musicService.searchParams$.subscribe((val: {trackTitle: string, artistTitle: string, albumTitle: string}) => {
      if (val.trackTitle || val.albumTitle) this.getTracks(val.trackTitle, val.albumTitle, '', '');
      else if (val.artistTitle) this.getArtists(val.artistTitle);
      else { this.tracks = []; this.artists = []; }
    });

    this.musicService.lists$.subscribe((val: {lists: Playlist[]}) => {
      this.lists = val.lists;
    });
  }

  // Get and display the genres
  getGenres(): void {
    //this.spinner.show();
    this.musicService.getGenres().subscribe(res => {
      this.genres = res;
      //this.spinner.hide();
    }, error => console.log(error));
  }

  // Get and display the tracks
  getTracks(trackTitle?: string, albumTitle?: string, genreTitle?: string, artistName?: string): void {
    this.spinner.show();
    this.musicService.getTracks(trackTitle, albumTitle, genreTitle, artistName).subscribe(res => {
      this.artists = [];
      this.tracks = res;
      this.spinner.hide();
    }, error => console.log(error));
  }

  // Get and display artists
  getArtists(artistName: string): void {
    this.spinner.show();
    this.musicService.getArtists(artistName).subscribe(res => {
      this.tracks = [];
      this.artists = res;
      this.spinner.hide();
    }, error => console.log(error));
  }

  // Open list selector modal and add to playlist
  addToList(track: Track): void {
    const modalRef = this.modalService.open(PlaylistSelectorComponent, {centered: true, windowClass: 'PlaylistSelectorModalClass'});
    modalRef.componentInstance.trackToInsert = track;
    modalRef.componentInstance.lists = this.lists;

    modalRef.componentInstance.selectedPlaylist.subscribe((playlist: Playlist) => {
      this.musicService.updateList(playlist, track).subscribe((res: any) => {
        playlist.trackList = res.tracks;
        // @ts-ignore
        playlist.totalPlayTime += parseInt(track.trackDuration.split(':')[0] * 60) + parseInt(track.trackDuration.split(':')[1]);
        playlist.trackCount += 1;

        this.musicService.updatedList$.next({list: playlist});
      });
    });

  }

  preview(type: string, preview: any): void {
    this.musicService.previewSelection$.next({preview: preview, type: type});
  }

  // Sort the table based on the header selected
  sortTable(index: number) {
    let table, rows, switching, i, x, y, shouldSwitch;
    table = document.querySelector("table");

    // Check whether to sort by ascending or descending order
    if (this.sortTracking.index == index) this.sortTracking.sort === 'ASC' ? this.sortTracking.sort = 'DESC' : this.sortTracking.sort = 'ASC';
    else this.sortTracking.index = index;

    // Keep swapping rows until table is fully sorted
    switching = true;
    while (switching) {
      switching = false;
      // @ts-ignore
      rows = table.rows;
      // Bubble sort algorithm
      for (i = 1; i < (rows?.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i]?.getElementsByTagName("TD")[index];
        y = rows[i + 1]?.getElementsByTagName("TD")[index];
        // Sort in either ascending or descending (ascending first)
        if (this.sortTracking?.sort === 'ASC') {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        } else {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        }

      }
      if (shouldSwitch) {
        // @ts-ignore
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }

}
