import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { JwtHelperService } from "@auth0/angular-jwt";

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  @Input() data: any;
  @Input() list: boolean = false;

  helper = new JwtHelperService();
  username: string = '';
  accessLvl: number = 0;

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.username = this.helper.decodeToken(localStorage.getItem('token') || undefined).username;
    this.accessLvl = this.helper.decodeToken(localStorage.getItem('token') || undefined).access_level;
  }

  createReview(event: any, review: string): void {
    event.preventDefault();
    if (!review.length) return;

    let currentDate = new Date();
    this.data.reviews.push({
      reviewBody: review,
      reviewAuthor: this.username,
      reviewDateTime: `${[currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()].join('-')} ${[currentDate.getHours(), currentDate.getMinutes()].join(':')}`
    });
    console.log(review);
  }

  close(): void {
    this.activeModal.close();
  }

}
