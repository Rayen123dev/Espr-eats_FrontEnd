import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-visio',
  templateUrl: './visio.component.html',
  styleUrls: ['./visio.component.scss']
})
export class VisioComponent implements OnInit, AfterViewInit {
  roomId: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const consultationId = this.route.snapshot.paramMap.get('id');
    this.roomId = `Espreats-consultation-${consultationId}`;
  }

  ngAfterViewInit(): void {
    this.startConference();
  }

  startConference(): void {
    const domain = 'meet.jit.si';
    const options = {
      roomName: this.roomId,
      width: '100%',
      height: 700,
      parentNode: document.querySelector('#jitsi-container'),
      userInfo: {
        displayName: 'Utilisateur'
      }
    };

    new JitsiMeetExternalAPI(domain, options);
  }
}
