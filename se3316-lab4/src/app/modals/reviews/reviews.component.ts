import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Output() listUpdated = new EventEmitter<boolean>();

  reviewList: Reviews[] = [];

  helper = new JwtHelperService();
  username: string = '';
  accessLvl: number = 0;

  constructor(private musicService: MusicService, public activeModal: NgbActiveModal, private modalService: NgbModal, private spinner: NgxSpinnerService) { }

  // Populate starting data
  ngOnInit(): void {
    this.spinner.show();

    this.musicService.getReviews(this.name, this.list ? 'List' : 'Track').subscribe(res => {
      this.reviewList = res;
      this.spinner.hide();
    })

    this.username = this.helper.decodeToken(localStorage.getItem('token') || undefined).username;
    this.accessLvl = this.helper.decodeToken(localStorage.getItem('token') || undefined).access_level;
  }

  // Return list of reviews after filtering by visibility
  filteredReviews(showHidden?: boolean): Reviews[] {
    if (showHidden) return this.reviewList.filter(review => review.visibility === 'Hidden');
    else return this.reviewList.filter(review => review.visibility === 'Visible');
  }

  // Return rating of playlist based on filtered review list
  rating(): number {
    let reviewCount: number = 0;
    let reviewSum: number = 0;
    this.filteredReviews().forEach((review: any) => {
      reviewCount++;
      reviewSum += review.rating;
    });
    return reviewSum / reviewCount;
  }

  // Create a new review
  createReview(event: any, review: string, rating: any): void {
    event.preventDefault();
    if (!review.length) return;

    let currentDate = new Date();
    let reqBody: Reviews = {
      body: review,
      author: this.username,
      submitted_date_time: this.getDate(new Date()),
      rating: parseInt(rating),
      visibility: "Visible",
      parent: this.name,
      review_type: this.list ? 'List' : 'Track'
    }

    if (this.list) this.listUpdated.emit(true);

    this.spinner.show();
    this.musicService.addReview(this.name, this.list ? 'List' : 'Track', reqBody).subscribe(res => {
      this.reviewList = res;
      this.spinner.hide();
    })
  }

  // Get formatted date
  getDate(date: any): string {
    return `${[date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-')} ${[date.getHours().toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    }), date.getMinutes().toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    }), date.getSeconds().toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    })].join(':')}`
  }

  // Toggle review visibility
  toggleReview(review: Reviews, visibility: string): void {
    this.spinner.show();
    this.musicService.toggleReview(this.name, this.list ? 'List' : 'Track', review, visibility).subscribe(res => {
      this.reviewList = res;
      this.spinner.hide();
    })
  }

  // Close modal
  close(): void {
    this.activeModal.close();
  }

}
