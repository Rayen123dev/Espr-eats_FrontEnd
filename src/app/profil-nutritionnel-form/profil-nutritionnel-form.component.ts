import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProfilNutritionnelService } from 'src/app/services/profil-nutritionnel.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profil-nutritionnel-form',
  templateUrl: './profil-nutritionnel-form.component.html',
  styleUrls: ['./profil-nutritionnel-form.component.css']
})
export class ProfilNutritionnelFormComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

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
    private fb: FormBuilder,
    private profilService: ProfilNutritionnelService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      sexe: ['', Validators.required],
      poidsActuel: ['', [Validators.required, Validators.min(1)]],
      taille: ['', [Validators.required, Validators.min(1)]],
      niveauActivite: ['', Validators.required],
      objectif: this.fb.array([], Validators.required),
      allergies: this.fb.array([], Validators.required),
      regimeAlimentaire: ['', Validators.required],
      fumeur: [false],
      groupeSanguin: ['', Validators.required]
    });

    this.loadEnums();
  }

  get objectifFormArray(): FormArray {
    return this.form.get('objectif') as FormArray;
  }

  get allergiesFormArray(): FormArray {
    return this.form.get('allergies') as FormArray;
  }

  loadEnums() {
    this.http.get<string[]>('http://localhost:8081/api/enums/objectifs')
      .subscribe(data => this.objectifs = data);

    this.http.get<string[]>('http://localhost:8081/api/enums/allergies')
      .subscribe(data => this.allergiesList = data);
  }

  onCheckboxChange(event: any, controlName: 'objectif' | 'allergies') {
    const formArray = this.form.get(controlName) as FormArray;
    const value = event.target.value;
    const isChecked = event.target.checked;

    if (controlName === 'allergies') {
      if (value === 'AUCUNE') {
        if (isChecked) {
          formArray.clear();
          formArray.push(this.fb.control('AUCUNE'));

          const checkboxes = document.querySelectorAll('input[type="checkbox"][name="allergie"]');
          checkboxes.forEach((cb: any) => {
            if (cb.value !== 'AUCUNE') cb.checked = false;
          });
        } else {
          const index = formArray.controls.findIndex(ctrl => ctrl.value === 'AUCUNE');
          if (index !== -1) formArray.removeAt(index);
        }
      } else {
        if (isChecked) {
          const aucuneIndex = formArray.controls.findIndex(ctrl => ctrl.value === 'AUCUNE');
          if (aucuneIndex !== -1) formArray.removeAt(aucuneIndex);

          if (!formArray.controls.find(ctrl => ctrl.value === value)) {
            formArray.push(this.fb.control(value));
          }

          const aucuneCheckbox = document.querySelector('input[type="checkbox"][value="AUCUNE"]') as HTMLInputElement;
          if (aucuneCheckbox) aucuneCheckbox.checked = false;
        } else {
          const index = formArray.controls.findIndex(ctrl => ctrl.value === value);
          if (index !== -1) formArray.removeAt(index);
        }
      }
    } else {
      if (isChecked) {
        if (!formArray.controls.find(ctrl => ctrl.value === value)) {
          formArray.push(this.fb.control(value));
        }
      } else {
        const index = formArray.controls.findIndex(ctrl => ctrl.value === value);
        if (index !== -1) formArray.removeAt(index);
      }
    }
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    const formValue = this.form.value;
    this.profilService.createProfil(formValue).subscribe({
      next: () => {
        this.successMessage = 'Votre profil a été créé avec succès !';
        setTimeout(() => this.router.navigate(['/profil-nutritionnel/mon-profil']), 2000);
      },
      error: () => {
        this.errorMessage = '❌ Une erreur est survenue.';
      }
    });
  }
}
