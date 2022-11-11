import { Component, OnInit } from '@angular/core';
import { MusicService } from "../../core/services/music/music.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Playlist } from "../../core/constants/common.enum";

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  previewAvailable: boolean = false;
  lists: Playlist[] | any = null;

  constructor(private musicService: MusicService,  private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.getLists();

    // Run when preview is set
    this.musicService.previewSelection$.subscribe((val: {preview: any, type: string}) => {
      // Handle when track preview is set
      if (val.preview) this.previewAvailable = true;
      else this.previewAvailable = false;
    });

    this.musicService.updatedList$.subscribe((val: {list: Playlist}) => {
      this.lists[this.lists.findIndex((list: Playlist) => list === val.list)] = val.list;
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

  readList(listName: string): void {
    this.spinner.show();
    this.musicService.getLists(listName).subscribe(res => {
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

}
