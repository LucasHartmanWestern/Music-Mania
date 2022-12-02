import { Component, OnInit } from '@angular/core';
import { MusicService } from "../../core/services/music/music.service";
import { Dmca } from "../../core/constants/common.enum";

import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-recorder-tool',
  templateUrl: './recorder-tool.component.html',
  styleUrls: ['./recorder-tool.component.scss']
})
export class RecorderToolComponent implements OnInit {

  btnState: boolean = false;
  records: Dmca[] = [];
  newRecord: Dmca[] = [];

  error: string = '';

  constructor(public activeModal: NgbActiveModal,private musicService: MusicService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.musicService.getDmca().subscribe(res => {
      this.records = res;
    });
  }

  state(event?: any, recordType?:string, date?: any, contentType?: string, contentName?:string, username?:string, ownerName?:string, ownerEmail?:string): void {
    event.preventDefault();

    if (!this.btnState) this.btnState = true;
    else {
      if (recordType && date && contentType && contentName && username && ownerName && ownerEmail) {
        this.musicService.createDmca(recordType, date, contentType, contentName, username, ownerName, ownerEmail).subscribe(res => {
          this.records = res;
        });
        this.btnState = false;
        this.error = '';
      } else {
        this.error = "Please fill in all details";
      }
    }
  }

  close(): void {
    this.activeModal.close();
  }

}
