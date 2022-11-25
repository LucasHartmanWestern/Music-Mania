import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Playlist, Track } from "../../core/constants/common.enum";
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-playlist-selector',
  templateUrl: './playlist-selector.component.html',
  styleUrls: ['./playlist-selector.component.scss']
})
export class PlaylistSelectorComponent implements OnInit {

  @Input() trackToInsert: Track | any;
  @Input() lists: Playlist[] | any;
  @Output() selectedPlaylist: EventEmitter<any> = new EventEmitter();

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) { }

  ngOnInit(): void { }

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
