import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProfilNutritionnelService } from 'src/app/services/profil-nutritionnel.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profil-nutritionnel-detail',
  templateUrl: './profil-nutritionnel-detail.component.html',
  styleUrls: ['./profil-nutritionnel-detail.component.scss']
})
export class ProfilNutritionnelDetailComponent implements OnInit {
  profil: any;
  profilId!: number;
  editMode = false;
  loading = false;
  form!: FormGroup;
  successMessage = '';

  objectifs: string[] = [];
  allergiesList: string[] = [];

  groupeSanguins = [
    { label: 'A+', value: 'A_POSITIF' },
    { label: 'A-', value: 'A_NEGATIF' },
    { label: 'B+', value: 'B_POSITIF' },
    { label: 'B-', value: 'B_NEGATIF' },
    { label: 'AB+', value: 'AB_POSITIF' },
    { label: 'AB-', value: 'AB_NEGATIF' },
    { label: 'O+', value: 'O_POSITIF' },
    { label: 'O-', value: 'O_NEGATIF' }
  ];

  constructor(
    private profilService: ProfilNutritionnelService,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEnums();
    this.loadProfil();
  }

  loadEnums(): void {
    this.http.get<string[]>('http://localhost:8081/api/enums/objectifs')
      .subscribe(data => this.objectifs = data);
    this.http.get<string[]>('http://localhost:8081/api/enums/allergies')
      .subscribe(data => this.allergiesList = data);
  }

  loadProfil(): void {
    this.loading = true;
    this.profilService.getMyProfil().subscribe({
      next: (data) => {
        this.profil = data;
        this.profilId = data.id;
        this.buildForm(data);
        this.loading = false;
      },
      error: () => {
        console.error('Erreur lors du chargement du profil.');
        this.loading = false;
      }
    });
  }

  buildForm(profil: any): void {
    this.form = this.fb.group({
      sexe: [profil.sexe, Validators.required],
      poidsActuel: [profil.poidsActuel, [Validators.required, Validators.min(1)]],
      taille: [profil.taille, [Validators.required, Validators.min(1)]],
      niveauActivite: [profil.niveauActivite, Validators.required],
      objectif: this.fb.array(profil.objectif || [], Validators.required),
      allergies: this.fb.array(profil.allergies || [], Validators.required),
      regimeAlimentaire: [profil.regimeAlimentaire, Validators.required],
      fumeur: [profil.fumeur, Validators.required],
      groupeSanguin: [profil.groupeSanguin, Validators.required]
    });
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
  }

  get objectifFormArray(): FormArray {
    return this.form.get('objectif') as FormArray;
  }

  get allergiesFormArray(): FormArray {
    return this.form.get('allergies') as FormArray;
  }

  onCheckboxChange(event: any, controlName: 'objectif' | 'allergies') {
    const formArray = this.form.get(controlName) as FormArray;
    const value = event.target.value;
    const checked = event.target.checked;

    if (controlName === 'allergies' && value === 'AUCUNE') {
      if (checked) {
        formArray.clear();
        formArray.push(this.fb.control(value));
      } else {
        const index = formArray.controls.findIndex(c => c.value === value);
        if (index >= 0) formArray.removeAt(index);
      }
    } else {
      const index = formArray.controls.findIndex(c => c.value === value);
      const aucuneIndex = formArray.controls.findIndex(c => c.value === 'AUCUNE');

      if (checked) {
        if (aucuneIndex !== -1) formArray.removeAt(aucuneIndex);
        if (index === -1) formArray.push(this.fb.control(value));
      } else {
        if (index !== -1) formArray.removeAt(index);
      }
    }
  }

  enregistrer(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.profilService.updateProfil(this.profilId, this.form.value).subscribe({
      next: () => {
        this.successMessage = ' Profil mis à jour avec succès.';
        this.editMode = false;
        this.loadProfil();
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: () => {
        this.successMessage = '❌ Erreur lors de la mise à jour.';
      },
      complete: () => this.loading = false
    });
  }

  getGroupeSanguinLabel(code: string | null): string {
    const map: { [key: string]: string } = {
      A_POSITIF: 'A+', A_NEGATIF: 'A-',
      B_POSITIF: 'B+', B_NEGATIF: 'B-',
      AB_POSITIF: 'AB+', AB_NEGATIF: 'AB-',
      O_POSITIF: 'O+', O_NEGATIF: 'O-'
    };
    return code && map[code] ? map[code] : 'Non précisé';
  }
}
