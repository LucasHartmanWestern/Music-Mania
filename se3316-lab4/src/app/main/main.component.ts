import { Component, OnInit } from '@angular/core';
import {Credentials} from "../core/constants/common.enum";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PolicyComponent } from '../modals/policy/policy.component';
import { RecorderToolComponent } from '../modals/recorder-tool/recorder-tool.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  admin: boolean = true;

  credentials: Credentials = {
    jwt: localStorage.getItem('token')
  };

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    console.log(this.credentials);
  }
  openPolicy(type: string): void{
    const modalRef = this.modalService.open(PolicyComponent, {centered: true, windowClass: 'PolicyModalClass',})
    modalRef.componentInstance.type = type;
  }
  openTools(): void{
    const modalRef = this.modalService.open(RecorderToolComponent, {centered: true, windowClass: 'Recorder-ToolModalClass',})
  }
}
