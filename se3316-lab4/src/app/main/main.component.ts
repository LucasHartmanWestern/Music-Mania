import { Component, OnInit } from '@angular/core';
import { Credentials } from "../core/constants/common.enum";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PolicyComponent } from '../modals/policy/policy.component';
import { RecorderToolComponent } from '../modals/recorder-tool/recorder-tool.component';
import { JwtHelperService } from "@auth0/angular-jwt";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  helper = new JwtHelperService();
  admin: boolean = this.helper.decodeToken(localStorage.getItem('token') || undefined)?.access_level >= 3;

  credentials: Credentials = {
    jwt: localStorage.getItem('token')
  };

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  // Open policy modal
  openPolicy(type: string): void{
    const modalRef = this.modalService.open(PolicyComponent, {centered: true, windowClass: 'PolicyModalClass',})
    modalRef.componentInstance.type = type;
  }

  // Open tools modal
  openTools(): void{
    const modalRef = this.modalService.open(RecorderToolComponent, {centered: true, windowClass: 'RecorderToolModalClass',})
  }
}
