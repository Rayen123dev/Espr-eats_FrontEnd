import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { LoginService } from 'src/app/login.service';

interface ProfanityResult {
  isProfanity: boolean;
  score: number;
  flaggedFor: string | string[]; // Can be string or array
  message?: string;
}

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})
// add-post.component.ts
export class AddPostComponent implements OnInit {
  postForm: FormGroup;
  selectedFile?: File;
  isLoading = false;
  errorMessage?: string;
  @Input() isReplyMode: boolean = false;
  //@Input() parentPostId?: string | null = null;
  @Input() parentPostId?: number | null = null;
  @Output() replyComplete = new EventEmitter<void>();
  profanityResult?: ProfanityResult;
  user: any;

  constructor(private fb: FormBuilder, private postService: PostService , private loginService: LoginService) {
  
    this.postForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }
  ngOnInit(): void {
    const userId = this.loginService.getUserIdFromToken();
    
    if (!userId) {
      this.handleError('Unable to retrieve user ID');
      return;
    }

    this.fetchUserProfile(userId);
    console.log('User ID:', userId);
    const U1= this.loginService.getUserById(userId) || this.user;
    

    throw new Error('Method not implemented.');
  }
  handleError(arg0: string) {
    throw new Error('Method not implemented.');
  }
  fetchUserProfile(userId: number) {
    throw new Error('Method not implemented.');
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        this.errorMessage = 'Invalid file type. Only images and MP4 videos are allowed.';
        return;
      }
      
      if (file.size > maxSize) {
        this.errorMessage = 'File is too large. Maximum size is 5MB.';
        return;
      }
      
      this.selectedFile = file;
      this.errorMessage = undefined;
    }
  }

  /*onSubmit(): void {
    if (this.postForm.invalid) return;
    
    this.isLoading = true;
    this.errorMessage = undefined;

    const newPost = {
      content: this.postForm.value.content,
      authorId: 1, // Or get from auth service
      parentId: this.isReplyMode ? this.parentPostId : undefined // Add parentId for replies
    };

    this.postService.addPost(newPost, this.selectedFile).subscribe({
      next: (response) => {
        console.log(this.isReplyMode ? 'Reply added successfully' : 'Post added successfully', response);
        this.postForm.reset();
        this.selectedFile = undefined;
        this.isLoading = false;
        this.postService.notifyPostsUpdated();
        // Emit event if in reply mode
        if (this.isReplyMode) {
          this.replyComplete.emit();
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }*/

    async checkProfanity(text: string): Promise<ProfanityResult> {
      try {
        const response = await fetch('https://vector.profanity.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Normalize the flaggedFor field to always be an array
        if (result.flaggedFor && !Array.isArray(result.flaggedFor)) {
          result.flaggedFor = [result.flaggedFor];
        }
        
        return result;
      } catch (error) {
        console.error('Error checking profanity:', error);
        return {
          isProfanity: false,
          score: 0,
          flaggedFor: [],
          message: 'Profanity check unavailable. Please be mindful of your language.'
        };
      }
    }
  
    async onSubmit(): Promise<void> {
      if (this.postForm.invalid) return;
      
      this.isLoading = true;
      this.errorMessage = undefined;
      this.profanityResult = undefined;
  
      // Check for profanity
      const result = await this.checkProfanity(this.postForm.value.content);
      this.profanityResult = result;
  
      if (result.isProfanity) {
        this.isLoading = false;
        return; // Stop submission if profanity detected
      }
      
      // Proceed with post submission
      const newPost = {
        content: this.postForm.value.content,
        authorId: this.loginService.getUserIdFromToken(), // Retrieve userId from loginService
        parentId: this.isReplyMode ? this.parentPostId : undefined

        


      };
  
      this.postService.addPost(newPost, this.selectedFile , ).subscribe({
        next: (response) => {
          console.log(this.isReplyMode ? 'Reply added successfully' : 'Post added successfully', response);
          this.postForm.reset();
          this.selectedFile = undefined;
          this.isLoading = false;
          this.postService.notifyPostsUpdated();
          if (this.isReplyMode) {
            this.replyComplete.emit();
          }
        },
        error: (err) => {
          console.error('Error:', err);
          this.errorMessage = err.message;
          this.isLoading = false;
        }
      });
    }
  
    getSeverityClass(score: number): string {
      if (score >= 0.8) return 'high';
      if (score >= 0.5) return 'medium';
      return 'low';
    }

    getFlaggedWords(result: ProfanityResult): string[] {
      if (!result.flaggedFor) return [];
      if (Array.isArray(result.flaggedFor)) return result.flaggedFor;
      return [result.flaggedFor]; // Convert string to array
    }

    formatScore(score: number): string {
      return Math.round(score * 100) + '%';
    }
}