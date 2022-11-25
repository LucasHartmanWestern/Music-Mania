import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "../../core/services/authentication/authentication.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Credentials } from "../../core/constants/common.enum";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  userList: Credentials[] = [];
  changeList: any[] = [];

  constructor(private authenticationService: AuthenticationService, public activeModal: NgbActiveModal, private modalService: NgbModal, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.spinner.show();
    this.authenticationService.getUsers().subscribe(res => {
      this.userList = res;
      this.spinner.hide();
    });
  }

  changeMade(user: Credentials, newValue: string, att: string): void {
    let currentChange = this.changeList.findIndex(change => {
      return (change.user == user && change.att == att);
    });

    if (currentChange !== -1) {
      if (newValue) this.changeList[currentChange].newValue = newValue;
      else this.changeList.splice(currentChange, 1);
    }
    else if (newValue) this.changeList.push({
      user: user,
      newValue: newValue,
      att: att
    });
  }

  saveChanges(): void {
    this.changeList.forEach(change => {
      this.authenticationService.updateUser(change.user, change.newValue, change.att).subscribe(res => {
        console.log(res);
      });
    });
    this.close();
  }

  close(): void {
    this.activeModal.close();
  }
}
