import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { JwtHelperService } from "@auth0/angular-jwt";
import { MusicService } from "../../core/services/music/music.service";
import { Reviews } from "../../core/constants/common.enum";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  @Input() name: string = '';
  @Input() list: boolean = false;

  reviewList: Reviews[] = [];

  helper = new JwtHelperService();
  username: string = '';
  accessLvl: number = 0;

  constructor(private musicService: MusicService, public activeModal: NgbActiveModal, private modalService: NgbModal, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.spinner.show();

    this.musicService.getReviews(this.name, this.list ? 'List' : 'Track').subscribe(res => {
      this.reviewList = res;
      this.spinner.hide();
    })

    this.username = this.helper.decodeToken(localStorage.getItem('token') || undefined).username;
    this.accessLvl = this.helper.decodeToken(localStorage.getItem('token') || undefined).access_level;
  }

  filteredReviews(): Reviews[] {
    return this.reviewList.filter(review => review.visibility === 'Visible');
  }

  rating(): number {
    let reviewCount: number = 0;
    let reviewSum: number = 0;
    this.filteredReviews().forEach((review: any) => {
      reviewCount++;
      reviewSum += review.rating;
    });
    return reviewSum / reviewCount;
  }

  createReview(event: any, review: string, rating: any): void {
    event.preventDefault();
    if (!review.length) return;

    let currentDate = new Date();
    let reqBody: Reviews = {
      body: review,
      author: this.username,
      submitted_date_time: `${[currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()].join('-')} ${[currentDate.getHours(), currentDate.getMinutes()].join(':')}`,
      rating: parseInt(rating),
      visibility: "Visible",
      parent: this.name,
      review_type: this.list ? 'List' : 'Track'
    }

    this.spinner.show();
    this.musicService.addReview(this.name, this.list ? 'List' : 'Track', reqBody).subscribe(res => {
      this.reviewList = res;
      this.spinner.hide();
    })
  }

  hideReview(review: Reviews): void {
    this.spinner.show();
    this.musicService.hideReview(this.name, this.list ? 'List' : 'Track', review).subscribe(res => {
      this.reviewList = res;
      this.spinner.hide();
    })
  }

  close(): void {
    this.activeModal.close();
  }

}
