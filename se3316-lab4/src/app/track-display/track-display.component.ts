import { Component, OnInit } from '@angular/core';
import { MusicService } from "../core/services/music/music.service";
import {Artist, Genre, Playlist, Track} from "../core/constants/common.enum";
import { PlaylistSelectorComponent } from "../modals/playlist-selector/playlist-selector.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from 'ngx-spinner';
import {ReviewsComponent} from "../modals/reviews/reviews.component";

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
  selectedList: Playlist | any = null;

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

    this.musicService.listTracks$.subscribe((val: {list: Playlist, tracks: Track[]}) => {
      this.tracks = val.tracks;
      this.selectedList = val.list;
    });

    this.musicService.selectList$.subscribe((val: {list: any}) => {
      this.selectedList = val.list;
    });
  }

  // Get and display the genres
  getGenres(): void {
    this.selectedList = null;
    this.musicService.getGenres().subscribe(res => {
      this.genres = res;
      //this.spinner.hide();
    }, error => console.log(error));
  }

  // Get and display the tracks
  getTracks(trackTitle?: string, albumTitle?: string, genreTitle?: string, artistName?: string): void {
    this.selectedList = null;
    this.spinner.show();
    this.musicService.getTracks(trackTitle, albumTitle, genreTitle, artistName).subscribe(res => {
      this.artists = [];
      this.tracks = res;
      this.spinner.hide();
    }, error => console.log(error));
  }

  // Get and display artists
  getArtists(artistName: string): void {
    this.selectedList = null;
    this.spinner.show();
    this.musicService.getArtists(artistName).subscribe(res => {
      this.tracks = [];
      this.artists = res;
      this.spinner.hide();
    }, error => console.log(error));
  }

  openReview(whatToReview: any, list: boolean) {
    whatToReview['reviews'] = [
      {reviewAuthor: "username1", reviewBody: "This is a test review body test test test", reviewDateTime: "2022-01-01 13:30", reviewRating: 3},
      {reviewAuthor: "username2", reviewBody: "This is a test 2 review body test test test", reviewDateTime: "2022-01-02 14:30", reviewRating: 1}
    ];
    console.log(whatToReview);

    const modalRef = this.modalService.open(ReviewsComponent, {centered: true, windowClass: 'ReviewsModalClass'});
    modalRef.componentInstance.data = whatToReview;
    modalRef.componentInstance.list = list;
  }

  // Open list selector modal and add to playlist
  addToList(track: Track): void {
    const modalRef = this.modalService.open(PlaylistSelectorComponent, {centered: true, windowClass: 'PlaylistSelectorModalClass'});
    modalRef.componentInstance.trackToInsert = track;
    modalRef.componentInstance.lists = this.lists;

    console.log(track);

    modalRef.componentInstance.selectedPlaylist.subscribe((playlist: any) => {
      this.musicService.updateList(playlist, [parseInt(track?.track_id), ...playlist?.tracks?.map((track: string) => parseInt(track))]).subscribe((res: any) => {
        playlist.tracks = res.tracks;
        // @ts-ignore
        playlist.totalPlayTime = this.updateTime(playlist.totalPlayTime, track.track_duration, true);
        playlist.trackCount += 1;

        this.musicService.updatedList$.next({list: playlist, delete: false});
      });
    });
  }

  // Remove selected track from playlist
  removeFromList(track: Track): void {
    this.musicService.updateList(this.selectedList, this.selectedList?.tracks.filter((element: any) => element != track.track_id).map((e: string) => parseInt(e))).subscribe((res: any) => {
      this.selectedList.tracks = res.tracks;
      // @ts-ignore
      this.selectedList.totalPlayTime = this.updateTime(this.selectedList.totalPlayTime, track.track_duration, false);
      this.selectedList.trackCount -= 1;

      this.musicService.updatedList$.next({list: this.selectedList, delete: false});
    });
    this.tracks.splice(this.tracks.findIndex((t: Track) => t === track), 1);
  }

  updateTime(currentTime: string, modifyBy: string, add: boolean): string {
    let oldTime = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]) + parseInt(currentTime.split(':')[2]) / 60;
    let modifiedTime = parseInt(modifyBy.split(':')[0]) * 60 + parseInt(modifyBy.split(':')[1]);
    let newTime = 0;
    if (add) newTime = modifiedTime + oldTime;
    else newTime = oldTime - modifiedTime;

    return `${Math.floor(newTime / 60).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    })}:${Math.floor(newTime % 60).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    })}:00`;
  }

  deleteList(list: Playlist): void {
    this.musicService.deleteList(list.listName).subscribe(res => {
      console.log(res);
    })
    this.tracks = [];
    this.musicService.updatedList$.next({list: this.selectedList, delete: true});
    this.selectedList = null;
  }

  renameList(event: any, newName: string): void {
    if (newName) {
      event.preventDefault();
      this.selectedList.listName = newName;
    }
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
