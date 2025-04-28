import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-reply-form',
  templateUrl: './reply-form.component.html',
  styleUrls: ['./reply-form.component.css']
})
export class ReplyFormComponent {
  @Input() postId!: number;
  @Output() replyComplete = new EventEmitter<void>();
  
  replyForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private postService: PostService
  ) {
    this.replyForm = this.fb.group({
      content: ['', Validators.required],
      media: [null]
    });
  }

  onSubmit(): void {
    if (this.replyForm.valid) {
      this.isSubmitting = true;
      const formData = new FormData();
      formData.append('content', this.replyForm.get('content')?.value);
      formData.append('parentPostId', this.postId.toString());
      
      const mediaFile = this.replyForm.get('media')?.value;
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      this.postService.addPost(formData).subscribe({
        next: () => {
          this.replyComplete.emit();
          this.replyForm.reset();
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.replyForm.get('media')?.setValue(file);
    }
  }
}
