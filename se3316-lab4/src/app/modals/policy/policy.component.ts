import { Component, OnInit, ViewEncapsulation, ElementRef, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})
export class PolicyComponent implements OnInit {
  @Input() type: string = '';
  
  constructor() { 
    
  }

  ngOnInit(): void {

    
  }

}
