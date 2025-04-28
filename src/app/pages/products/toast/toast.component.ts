// toast.component.ts
import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent implements OnInit {
  message: string = '';
  show: boolean = false;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toast$.subscribe((message) => {
      this.message = message;
      this.show = true;
      setTimeout(() => (this.show = false), 3000); // Hide after 3 seconds
    });
  }
}
