import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { MusicService } from "../../core/services/music/music.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Credentials, Playlist } from "../../core/constants/common.enum";
import { JwtHelperService } from "@auth0/angular-jwt";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UsersComponent } from "../../modals/users/users.component";

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  @Output() logout = new EventEmitter<Credentials>();

  previewAvailable: boolean = false;
  lists: Playlist[] | any = null;
  helper = new JwtHelperService();
  access_level: number = 0;

  constructor(private musicService: MusicService, private modalService: NgbModal, private spinner: NgxSpinnerService) { }

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

      console.log(this.displayLists());
    });

    this.access_level = this.helper.decodeToken(localStorage.getItem('token') || undefined).access_level;
  }

  // Get and display the lists
  getLists(): void {
    this.spinner.show();
    this.musicService.getLists().subscribe(res => {
      this.lists = res;
      this.musicService.lists$.next({lists: this.lists});
      this.spinner.hide();
    }, error => console.log(error));
  }

  displayLists(): Playlist[] {
    return this.lists?.sort((a: Playlist, b: Playlist) => {
      return a.lastModified > b.lastModified ? -1 : a.lastModified < b.lastModified ? 1 : 0;
    });
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
      this.lists.push({
        listName: listName,
        owner: this.helper.decodeToken(localStorage.getItem('token') || undefined)?.username,
        lastModified: this.getDate(new Date()),
        trackCount: 0,
        tracks: [],
        totalPlayTime: '00:00:00'
      });
      this.musicService.lists$.next({lists: this.lists});
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      alert(error);
    });
  }

  getListInfo(list: Playlist): string {
    return `${list.trackCount} tracks - ${list.totalPlayTime} duration`;
  }

  showUsers(): void {
    const modalRef = this.modalService.open(UsersComponent, {centered: true, windowClass: 'UsersModalClass'});
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

  home(): void {
    this.musicService.previewSelection$.next({preview: null, type: ''});
    this.musicService.searchParams$.next({trackTitle: '', artistTitle: '', albumTitle: ''});
    this.musicService.selectList$.next({list: null});
  }

  logoutOfApp(): void {
    this.logout.emit({jwt: null});
    localStorage.removeItem('token');
  }

}
