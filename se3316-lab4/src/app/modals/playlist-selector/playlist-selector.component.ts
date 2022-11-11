import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Track } from "../../core/constants/common.enum";
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-playlist-selector',
  templateUrl: './playlist-selector.component.html',
  styleUrls: ['./playlist-selector.component.scss']
})
export class PlaylistSelectorComponent implements OnInit {

  @Input() trackToInsert: any;
  @Output() selectedPlaylist: EventEmitter<any> = new EventEmitter();

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) { }

  ngOnInit(): void {
  }


  // Save the changes and close the modal
  editDetails(selectedList: any){
    this.selectedPlaylist.emit(selectedList);
    this.close();
  }

  close() {
    this.activeModal.close();
  }

}
