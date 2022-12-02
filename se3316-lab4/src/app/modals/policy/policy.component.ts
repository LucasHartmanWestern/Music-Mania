import { Component, OnInit, Input } from '@angular/core';
import { JwtHelperService } from "@auth0/angular-jwt";
import { MusicService } from "../../core/services/music/music.service";
import { NgxSpinnerService } from "ngx-spinner";


@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})
export class PolicyComponent implements OnInit {

  @Input() type: string = '';
  @Input() content: string = '';

  helper = new JwtHelperService();
  admin: boolean = this.helper.decodeToken(localStorage.getItem('token') || undefined).access_level >= 3;
  editPolicy: boolean = false;

  privacyPolicy: string = '';
  usePolicy: string = '';
  dmcaPolicy: string = '';

  constructor(private musicService: MusicService, private spinner: NgxSpinnerService) {
  }

  ngOnInit(): void {
    this.spinner.show();
    this.musicService.getPolicy(this.type).subscribe(res => {
      if (this.type === 'privacy') this.privacyPolicy = res.body;
      if (this.type === 'use') this.usePolicy = res.body;
      if (this.type === 'dmca') this.dmcaPolicy = res.body;

      this.spinner.hide();
    }, error => this.spinner.hide());
  }

  savePolicy(newPolicy: string): void {
    this.spinner.show();
    this.musicService.updatePolicy(this.type, newPolicy).subscribe(res => {
      if (this.type === 'privacy') this.privacyPolicy = res.body;
      if (this.type === 'use') this.usePolicy = res.body;
      if (this.type === 'dmca') this.dmcaPolicy = res.body;

      this.spinner.hide();
    }, error => this.spinner.hide());
  }
}
