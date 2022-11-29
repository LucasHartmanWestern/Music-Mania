import { Component, OnInit, ViewEncapsulation, ElementRef, Input, OnDestroy } from '@angular/core';
import { JwtHelperService } from "@auth0/angular-jwt";


@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})
export class PolicyComponent implements OnInit {

  @Input() type: string = '';
  admin: boolean = true;
  helper = new JwtHelperService();
  editPolicy: boolean = false;
  access_level = this.helper.decodeToken(localStorage.getItem('token') || undefined).access_level;
  
  constructor() { 
    
  }

  ngOnInit(): void {

    
  }
  /*
  savePolicy(newPolicy: string): void {
    this.musicService.updateDescription(this.selectedList.listName, newDescription).subscribe(res => {
      this.selectedList.description = newDescription;
    });
  }*/

}
