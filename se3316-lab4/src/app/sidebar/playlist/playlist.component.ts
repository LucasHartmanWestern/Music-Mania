import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { MusicService } from "../../core/services/music/music.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Credentials, Playlist } from "../../core/constants/common.enum";

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  @Output() logout = new EventEmitter<Credentials>();

  previewAvailable: boolean = false;
  lists: Playlist[] | any = null;
  accessLevel: number = parseInt(localStorage.getItem('credAccess') || '0');

  constructor(private musicService: MusicService,  private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.getLists();

    // Run when preview is set
    this.musicService.previewSelection$.subscribe((val: {preview: any, type: string}) => {
      // Handle when track preview is set
      if (val.preview) this.previewAvailable = true;
      else this.previewAvailable = false;
    });

    this.musicService.updatedList$.subscribe((val: {list: Playlist, delete: boolean}) => {
      if (!val.delete) this.lists[this.lists.findIndex((list: Playlist) => list === val.list)] = val.list;
      else if (val.delete) this.lists.splice(this.lists.findIndex((list: Playlist) => list === val.list), 1);
    });
  }

  // Get and display the genres
  getLists(): void {
    this.spinner.show();
    this.musicService.getLists().subscribe(res => {
      this.lists = res;
      this.musicService.lists$.next({lists: this.lists});
      this.spinner.hide();
    }, error => console.log(error));
  }

  readList(list: Playlist): void {
    this.spinner.show();
    this.musicService.getLists(list.listName).subscribe(res => {
      this.musicService.listTracks$.next({list: list, tracks: res});
      console.log(res);
      this.spinner.hide();
    }, error => console.log(error));
  }

  createList(listName: string): void {
    this.spinner.show();
    this.musicService.createList(listName).subscribe(res => {
      this.lists.push({listName: listName, trackCount: 0, trackList: [], totalPlayTime: 0});
      this.musicService.lists$.next({lists: this.lists});
      this.spinner.hide();
    }, error => console.log(error));
  }

  getListInfo(list: Playlist): string {
    return `${list.trackCount} tracks - ${Math.floor(list.totalPlayTime / 60).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    })}:${(list.totalPlayTime % 60).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    })} duration`;
  }

  home(): void {
    this.musicService.previewSelection$.next({preview: null, type: ''});
    this.musicService.searchParams$.next({trackTitle: '', artistTitle: '', albumTitle: ''});
  }

  logoutOfApp(): void {
    this.logout.emit({user: null, pass: null, access_level: null});
    localStorage.removeItem('credUser');
    localStorage.removeItem('credPass');
    localStorage.removeItem('credAccess');
  }

}
