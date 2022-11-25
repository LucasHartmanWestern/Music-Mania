import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Playlist, Track } from "../../core/constants/common.enum";
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { JwtHelperService } from "@auth0/angular-jwt";

@Component({
  selector: 'app-playlist-selector',
  templateUrl: './playlist-selector.component.html',
  styleUrls: ['./playlist-selector.component.scss']
})
export class PlaylistSelectorComponent implements OnInit {

  @Input() trackToInsert: Track | any;
  @Input() lists: Playlist[] | any;
  @Output() selectedPlaylist: EventEmitter<any> = new EventEmitter();

  helper = new JwtHelperService();
  username = this.helper.decodeToken(localStorage.getItem('token') || undefined).username;

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) { }

  ngOnInit(): void {}

  getLists(): Playlist[] {
   return this.lists.filter((list: Playlist) => list.owner === this.username);
  }

  // Save the changes and close the modal
  selectList(selectedList: any){
    console.log(selectedList);
    this.selectedPlaylist.emit(selectedList);
    this.close();
  }

  close() {
    this.activeModal.close();
  }

}
