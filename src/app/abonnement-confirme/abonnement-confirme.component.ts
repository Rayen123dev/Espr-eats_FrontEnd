// abonnement-confirme.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Abonnement } from '../../abonnement.service';
import { UserInfo } from '../user-info.interface';

@Component({
  selector: 'app-abonnement-confirme',
  templateUrl: './abonnement-confirme.component.html',
  styleUrls: ['./abonnement-confirme.component.css'],
})
export class AbonnementConfirmeComponent implements OnInit {
  subscriptionDetails: Abonnement | null = null;
  userInfo: UserInfo | null = null;
  formattedCout: string = 'N/A';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as {
        abonnement: Abonnement;
        userInfo: UserInfo;
      };
      this.subscriptionDetails = state.abonnement;
      this.userInfo = state.userInfo;
    } else {
      const state = window.history.state;
      if (state && state.abonnement && state.userInfo) {
        this.subscriptionDetails = state.abonnement;
        this.userInfo = state.userInfo;
      }
    }

    if (!this.subscriptionDetails || !this.userInfo) {
      console.error('No subscription or user info found');
      this.router.navigate(['/abonnement']);
      return;
    }

    if (this.subscriptionDetails.cout !== undefined) {
      this.formattedCout = this.subscriptionDetails.cout.toFixed(2);
    }
  }
}
