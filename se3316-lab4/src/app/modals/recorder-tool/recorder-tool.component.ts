import { Component, OnInit } from '@angular/core';
import { MusicService } from "../../core/services/music/music.service";
import { Dmca } from "../../core/constants/common.enum";

@Component({
  selector: 'app-recorder-tool',
  templateUrl: './recorder-tool.component.html',
  styleUrls: ['./recorder-tool.component.scss']
})
export class RecorderToolComponent implements OnInit {

  btnState: boolean = false;
  records: Dmca[] = [];
  newRecord: Dmca[] = [];

  constructor(private musicService: MusicService) { }

  ngOnInit(): void {
    this.display();
  }

  state(event?: any, recordType?:string, date?: any, contentType?: string, contentName?:string, username?:string, ownerName?:string, ownerEmail?:string): void
  {
    event.preventDefault();
    this.btnState = !this.btnState;

    if (this.btnState == false)
    {
      this.musicService.createDmca(recordType, date, contentType, contentName, username, ownerName, ownerEmail).subscribe(req => {
        this.records = req;
      })
    }
  }

  display(): void {
    this.musicService.getDmca().subscribe(res => {
      this.records = res;
      console.log(res);
    });
  }
  add():void {

  }
}
