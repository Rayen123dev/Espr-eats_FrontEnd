import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Post } from 'src/app/core/models/post';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.css']
})
export class PostDetailsComponent implements OnInit {
  postID: number | null = null;  // To store the postID from URL
  post: Post | null = null;       // To store the post data
  showReplyForm: boolean = false; // To toggle the visibility of the reply form
  replyingToPostId: number | null = null;  // To track which post we are replying to

  
    posts: any[] = [];
    private postUpdateSubscription!: Subscription;
    currentUserId: number = 1; // Replace 1 with the actual logic to get the current user ID
    selectedFile: File | null = null;
    updatedFile: File | null = null;


  constructor(
    private route: ActivatedRoute, 
    private postService: PostService
  ) {}

  ngOnInit(): void {
    // Get postID from the URL
    this.postID = +this.route.snapshot.paramMap.get('postID')!;

    // Fetch the post details based on postID
    this.fetchPostDetails();

    this.loadPosts();

    // Listen for post updates
    this.postUpdateSubscription = this.postService.getPostsUpdatedListener()
      .subscribe(() => {
        this.loadPosts();
      });
  }

  fetchPostDetails(): void {
    if (this.postID) {
      this.postService.getPostDetails(this.postID).subscribe({
        next: (response) => {
          console.log('API Response:', response); // Debug log
  
          this.post = {
            ...response,
            authorUsername: response.authorUsername || 'Anonymous',  // Use API's direct value
            mediaURL: response.mediaURL, 
            replies: response.replies?.map((reply: any) => ({
              postID: reply.postID,
              content: reply.content,
              mediaURL: reply.mediaURL,  
              createdAt: reply.createdAt,
              authorId: reply.authorId,
              authorUsername: reply.authorUsername || 'Anonymous',
            }))
          };
  
          console.log('Post Author:', this.post.authorUsername);
          console.log('Post Media:', this.post.mediaURL);
        },
        error: (error) => {
          console.error('Error loading post:', error);
        }
      });
    }
  }
  


  deletePost(postId: any): void {  // Temporarily use 'any' for debugging
    console.log('Delete initiated with:', { 
      postId, 
      type: typeof postId,
      posts: this.posts 
    });
  
    if (postId === undefined || postId === null) {
      console.error('Post ID is undefined/null');
      alert('Cannot delete post: Invalid ID');
      return;
    }
  
    // Convert to number if it's a string
    const numericPostId = Number(postId);
    if (isNaN(numericPostId)) {
      console.error('Post ID is not a valid number:', postId);
      alert('Cannot delete post: Invalid ID format');
      return;
    }
  
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(numericPostId, this.currentUserId).subscribe({
        next: () => {
          this.posts = this.posts.filter(post => post.postID === numericPostId);
          alert('Post deleted successfully');
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert(err.message || 'Error deleting post');
        }
      });
    }
  }

  updatePost(postId: number): void {
    const postToUpdate = this.posts.find(p => p.postID === postId);
    if (!postToUpdate) {
      alert('Post not found');
      return;
    }

    const postData = {
      content: postToUpdate.updatedContent || postToUpdate.content,
      mediaURL: postToUpdate.mediaURL // Include existing media URL
    };

    this.postService.updatePost(postId, postData, this.updatedFile || undefined).subscribe({
      next: (updatedPost) => {
        const index = this.posts.findIndex(p => p.postID === postId);
        if (index !== -1) {
          this.posts[index] = {
            ...updatedPost,
            editing: false,
            updatedContent: '',
            updatedmediaURL: ''
          };
        }
        this.updatedFile = null;
        alert('Post updated successfully');
      },
      error: (err) => {
        console.error('Update error:', err);
        alert(err.message || 'Failed to update post');
      }
    });
  }

  loadPosts(): void {
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        // Ensure each post has the editing flag
        this.posts = data.map(post => ({
          ...post,
          editing: false,
          updatedContent: post.content
        }));
      },
      error: (err) => console.error(err)
    });
  }

 /* getmediaURL(mediaPath: string): string {
    return `${this.postService.getBaseUrl()}/forum-uploads/${mediaPath}`;
  }*/
  getmediaURL(mediaPath: string): string {
    return `http://localhost:8089/forum/forum-uploads/${mediaPath}`;
  }

  isImage(url: string): boolean {
    return /\.(jpe?g|png|gif|bmp|webp)$/i.test(url);
  }
  
  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg)$/i.test(url);
  }
  
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    // You could show a placeholder here if needed
  }

  getVideoType(url: string): string {
    if (url.endsWith('.mp4')) return 'video/mp4';
    if (url.endsWith('.webm')) return 'video/webm';
    if (url.endsWith('.ogg')) return 'video/ogg';
    return 'video/mp4'; // default
  }

  openMediaViewer(url: string): void {
    window.open(this.getmediaURL(url), '_blank');
  }

  formatDate(dateInput: number[] | string | Date): string {
    // Handle array format [year, month, day, hours, minutes, seconds]
    if (Array.isArray(dateInput)) {
      if (dateInput.length < 6) return '';
      const [year, month, day, hours, minutes, seconds] = dateInput;
      return new Date(year, month - 1, day, hours, minutes, seconds).toLocaleString();
    }
    
    // Handle string or Date formats
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? '' : date.toLocaleString();
  }

  onPostCreated(): void {
    this.replyingToPostId = null;
    this.loadPosts(); // Refresh the posts
  }

  startReply(postId: number): void {
    this.replyingToPostId = postId;
    this.showReplyForm = true;
  }

  onReplyComplete(): void {
    this.replyingToPostId = null;
    this.showReplyForm = false;
    this.loadPosts(); // Refresh to show new reply
  }

  
  
}



