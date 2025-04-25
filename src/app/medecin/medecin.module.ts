import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MedecinRoutingModule } from './medecin-routing.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderMedecinComponent } from './header-medecin/header-medecin.component';
import { ConsultationsMedecinComponent } from './consultations-medecin/consultations-medecin.component';
import { ConsultationDetailComponent } from './consultation-detail/consultation-detail.component';
import { ValidationsMenuComponent } from './validations-menu/validations-menu.component';

import { NgChartsModule } from 'ng2-charts';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FullCalendarModule } from '@fullcalendar/angular';
import { SuiviEtudiantComponent } from './suivi-etudiant/suivi-etudiant.component';


// 📍 Enregistrer la locale française pour les dates (important pour 'fr' dans le calendrier)
registerLocaleData(localeFr);

@NgModule({
  declarations: [
    DashboardComponent,
    HeaderMedecinComponent,
    ConsultationsMedecinComponent,
    ConsultationDetailComponent,
    ValidationsMenuComponent,
    SuiviEtudiantComponent,
  ],
  imports: [
    CommonModule,
    MedecinRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule,
    CalendarModule,
    BrowserAnimationsModule,
    FullCalendarModule,
  ],
  exports: [
    HeaderMedecinComponent
  ],  // <-- This comma was missing
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory
    }
  ]
})
export class MedecinModule { }
