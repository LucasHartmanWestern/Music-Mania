import { Component, OnInit } from '@angular/core';
import { MusicService } from "../core/services/music/music.service";
import { Artist, Genre, Playlist, Track } from "../core/constants/common.enum";
import { PlaylistSelectorComponent } from "../modals/playlist-selector/playlist-selector.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from 'ngx-spinner';
import { ReviewsComponent } from "../modals/reviews/reviews.component";
import { JwtHelperService } from "@auth0/angular-jwt";
import {ConfirmComponent} from "../modals/confirm/confirm.component";

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
  helper = new JwtHelperService();
  editDescription: boolean = false;
  username = this.helper.decodeToken(localStorage.getItem('token') || undefined).username;
  access_level = this.helper.decodeToken(localStorage.getItem('token') || undefined).access_level;

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

  openReview(name: string, list: boolean) {
    const modalRef = this.modalService.open(ReviewsComponent, {centered: true, windowClass: 'ReviewsModalClass'});
    modalRef.componentInstance.name = name;
    modalRef.componentInstance.list = list;
    modalRef.componentInstance.listUpdated.subscribe((res: boolean) => {
      this.selectedList.lastModified = this.getDate(new Date());
      this.musicService.updatedList$.next({list: this.selectedList, delete: false});
    });
  }

  // Open list selector modal and add to playlist
  addToList(track: Track): void {
    const modalRef = this.modalService.open(PlaylistSelectorComponent, {centered: true, windowClass: 'PlaylistSelectorModalClass'});
    modalRef.componentInstance.trackToInsert = track;
    modalRef.componentInstance.lists = this.lists;

    modalRef.componentInstance.selectedPlaylist.subscribe((playlist: any) => {
      if (playlist.tracks.includes(track.track_id)) {
        alert("Playlist already contains track");
        return;
      }

      this.musicService.updateList(playlist, [parseInt(track?.track_id), ...playlist?.tracks?.map((track: string) => parseInt(track))]).subscribe((res: any) => {
        playlist.tracks = res.tracks;
        // @ts-ignore
        playlist.totalPlayTime = this.updateTime(playlist.totalPlayTime, track.track_duration, true);
        playlist.trackCount += 1;
        playlist.lastModified = this.getDate(new Date());

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
    const modalRef = this.modalService.open(ConfirmComponent, {centered: true, windowClass: 'ConfirmModalClass'});
    modalRef.componentInstance.message = 'Are you sure you want to delete this playlist?';
    modalRef.componentInstance.confirmed.subscribe((res: boolean) => {
      this.musicService.deleteList(list.listName).subscribe(res => {
        console.log(res);
      });
      this.tracks = [];
      this.musicService.updatedList$.next({list: this.selectedList, delete: true});
      this.selectedList = null;
    });
  }

  renameList(event: any, newName: string): void {
    if (newName) {
      event.preventDefault();
      this.musicService.renameList(this.selectedList.listName, newName).subscribe(res => {
        this.selectedList.listName = newName;
        let currentDate = new Date();
        this.selectedList.lastModified = this.getDate(new Date());
        this.musicService.updatedList$.next({list: this.selectedList, delete: false});
      });
    }
  }

  saveDescription(newDescription: string): void {
    if (!newDescription) return;
    this.musicService.updateDescription(this.selectedList.listName, newDescription).subscribe(res => {
      this.selectedList.description = newDescription;
    });
  }

  updateVisibility(list: Playlist, visibility: string): void {
    list.visibility = visibility;
    this.musicService.playlistVisibility(list.listName, visibility).subscribe(res => {
      let currentDate = new Date();
      this.selectedList.lastModified = this.getDate(new Date());
      this.musicService.updatedList$.next({list: this.selectedList, delete: false});
    });
  }

  preview(type: string, preview: any): void {
    this.musicService.previewSelection$.next({preview: preview, type: type});
  }

  getDate(date: any): string {
    return `${[date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-')} ${[date.getHours().toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    }), date.getMinutes().toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    }), date.getSeconds().toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    })].join(':')}`
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
