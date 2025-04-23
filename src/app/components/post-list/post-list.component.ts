import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from '../../services/post.service';
import { Subscription } from 'rxjs';
import { ReactionServiceService } from '../../services/reaction-service.service';
import { TranslationService } from 'src/app/services/translation.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SearchService } from 'src/app/services/search.service';
import { ImageDescriptionService } from 'src/app/services/image-description.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: any[] = [];
  private postUpdateSubscription!: Subscription;
  currentUserId: number = 1; // Replace 1 with the actual logic to get the current user ID
  selectedFile: File | null = null;
  updatedFile: File | null = null;
  replyingToPostId: number | null = null;
  showReplyForm: boolean = false;

  emojiList = [
    { type: 'LIKE', label: '👍' },
    { type: 'LOVE', label: '❤️' },
    { type: 'LAUGH', label: '😂' },
    { type: 'ANGRY', label: '😡' },
    { type: 'DISLIKE', label: '👎' }
  ];


 onFileSelected(event: Event, isUpdate: boolean = false): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    
    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Only images and MP4 videos are allowed.');
      return;
    }
    
    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }

    if (isUpdate) {
      this.updatedFile = file;
    } else {
      this.selectedFile = file;
    }
  }
  
}
  constructor(private postService: PostService,
     private reactionService: ReactionServiceService,
     private translationService: TranslationService,
     private searchService: SearchService,
     private imageDescriptionService: ImageDescriptionService,
     private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPosts();
    this.checkPostEngagements();
    //setInterval(() => this.checkPostEngagements(), 30000); //30 secs 

    // Listen for post updates
    this.postUpdateSubscription = this.postService.getPostsUpdatedListener()
      .subscribe(() => {
        this.loadPosts();
      });
  }

  /*loadPosts(): void {
    this.isSearching = false;
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        this.posts = data.map(post => ({
          ...post,
          editing: false,
          updatedContent: post.content,
          reactions: post.reactions || [] // Ensure reactions exists
        }));
        console.log('Loaded posts with reactions:', this.posts);
      },
      error: (err) => console.error(err)
    });
  }*/

    /*loadPosts(page: number = 0, size: number = 5): void {
      this.isSearching = false;
      
      this.postService.getAllPosts().subscribe({
        next: (response: any) => {
          this.posts = response.content.map((post: any) => ({
            ...post,
            editing: false,
            updatedContent: post.content,
            reactions: post.reactions || [] // Maintain reactions handling
          }));
          
          // Pagination metadata
          this.currentPage = response.number; // Current page number
          this.totalPages = response.totalPages; // Total pages available
          this.totalPosts = response.totalElements; // Total posts available
          
          console.log('Loaded posts with pagination:', {
            posts: this.posts,
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            totalPosts: this.totalPosts
          });
        },
        error: (err) => console.error('Error loading posts:', err)
      });
    }*/

    loadPosts(): void {
      this.postService.getAllPosts().subscribe({
        next: (response: any[]) => {
          this.allPosts = response.map((post: any) => ({
            ...post,
            editing: false,
            updatedContent: post.content,
            reactions: post.reactions || [],
            gisTrendin: (post.reactions?.length || 0) > 3
          }));
    
          this.totalPosts = this.allPosts.length;
          this.totalPages = Math.ceil(this.totalPosts / this.pageSize);
    
          this.updatePage(); // Set posts for current page
        },
        error: (err) => console.error('Error loading posts:', err)
      });
    }


  ngOnDestroy(): void {
    if (this.postUpdateSubscription) {
      this.postUpdateSubscription.unsubscribe();
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
      mediaUrl: postToUpdate.mediaUrl // Include existing media URL
    };

    this.postService.updatePost(postId, postData, this.updatedFile || undefined).subscribe({
      next: (updatedPost) => {
        const index = this.posts.findIndex(p => p.postID === postId);
        if (index !== -1) {
          this.posts[index] = {
            ...updatedPost,
            editing: false,
            updatedContent: '',
            updatedMediaUrl: ''
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

 /* getMediaUrl(mediaPath: string): string {
    return ${this.postService.getBaseUrl()}/forum-uploads/${mediaPath};
  }*/
  getMediaUrl(mediaPath: string): string {
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
    window.open(this.getMediaUrl(url), '_blank');
  }

  formatDate(dateArray: number[]): string {
    if (!dateArray || dateArray.length < 6) return '';
    const [year, month, day, hours, minutes, seconds] = dateArray;
    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    return date.toLocaleString();
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

  /*addReaction(postId: number, emojiType: string): void {
    const reaction = {
      emoji: emojiType,                          // e.g., 'LIKE', 'LOVE', etc.
      user: { userId: this.currentUserId },      // The user object with the userId
      parent: { postID: postId }                 // The post object with postID
    };
  
    this.reactionService.addReaction(reaction).subscribe({
      next: () => {
        console.log('Reaction added');
        this.loadPosts();  // Refresh posts to update reactions
      },
      error: (err: any) => {
        console.error('Error adding reaction:', err);
      },
    });
  }*/

  getEmojiLabel(emojiType: string): string {
    const emojiMap: { [key: string]: string } = {
      'LIKE': '👍',
      'LOVE': '❤️',
      'LAUGH': '😂',
      'ANGRY': '😡',
      'DISLIKE': '👎'
    };
    return emojiMap[emojiType] || '❓';
  }

  getReactionEntries(reactionCounts: { [key: string]: number } = {}): { key: string, value: number }[] {
    return Object.entries(reactionCounts).map(([key, value]) => ({ key, value }));
  }
  
  getReactionTypes(reactionCounts: any): string[] {
    if (!reactionCounts) return [];
    return Object.keys(reactionCounts).filter(emoji => reactionCounts[emoji] > 0);
  }

  
  addReaction(postId: number, emojiType: string): void {
    this.reactionService.toggleReaction(postId, this.currentUserId, emojiType)
      .subscribe({
        next: (response) => {
          // Find the post in our local array
          const post = this.posts.find(p => p.postID === postId);
          if (!post) return;

          if (response.removed) {
            // Remove reaction from local state
            post.reactions = post.reactions.filter((r: { userId: number; }) => 
              r.userId !== this.currentUserId
            );
          } else {
            // Add or update reaction in local state
            const existingIndex = post.reactions.findIndex((r: { userId: number; }) => 
              r.userId === this.currentUserId
            );
            
            const newReaction = {
              reactionId: response.reactionId,
              emoji: response.emoji,
              userId: response.userId
            };

            if (existingIndex >= 0) {
              post.reactions[existingIndex] = newReaction;
            } else {
              post.reactions = [...(post.reactions || []), newReaction];
            }
          }

          // Update reaction counts
          this.updateReactionCounts(post);
        },
        error: (err) => console.error('Error toggling reaction:', err)
      });
  }

  // Helper to update reaction counts
  updateReactionCounts(post: any): void {
    post.reactionCounts = {};
    (post.reactions || []).forEach((reaction: any) => {
      if (reaction.emoji) {
        post.reactionCounts[reaction.emoji] = 
          (post.reactionCounts[reaction.emoji] || 0) + 1;
      }
    });
  }

  // Check if current user has reacted with specific emoji
  hasReacted(post: any, emojiType: string): boolean {
    return (post.reactions || []).some(
      (r: any) => r.userId === this.currentUserId && r.emoji === emojiType
    );
  }
  

//Translation service

translatingPostId: number | null = null;
sourceLanguage = 'en';
targetLanguage = 'es';
translationResults: { [postId: number]: string } = {};
isTranslating = false;

async translatePost(post: any) {
  this.translatingPostId = post.postID;
  this.isTranslating = true;
  
  try {
    // First detect language
    this.sourceLanguage = await this.translationService.detectLanguage(post.content);
    
    // Then translate
    this.translationResults[post.postID] = 
      await this.translationService.translateText(
        post.content,
        this.sourceLanguage,
        this.targetLanguage
      );
  } catch (error) {
    this.translationResults[post.postID] = "Translation unavailable";
  } finally {
    this.isTranslating = false;
  }
}

showOriginal(postId: number) {
  this.translatingPostId = null;
  delete this.translationResults[postId];
}

get availableLanguages() {
  return this.translationService.getSupportedLanguages();
}

//engagement

/*getTotalEngagement(post: any): number {
  return (post.replies?.length || 0) + (post.reactions?.length || 0);
}

isTrending(post: any): boolean {
  const engagementThreshold = 3; // Match this with your backend threshold
  return this.getTotalEngagement(post) >= engagementThreshold;
}
*/
getTotalEngagement(post: any): number {
  const replies = post.replies || [];
  const reactions = post.reactions || [];
  return replies.length + reactions.length;
}

isTrending(post: any): boolean {
  const engagementThreshold = 3;
  const total = this.getTotalEngagement(post);
  console.log(`Post ${post.id} engagement: ${total}`); // Debug logging
  return total >= engagementThreshold;
}

/*
checkPostEngagements() {
  this.http.get('http://localhost:8089/forum/engagement/check').subscribe({
    next: () => console.log("Engagement check triggered successfully"),
    error: (err: any) => console.error("Error checking engagement:", err)
  });
}*/

checkPostEngagements() {
  this.http.get('http://localhost:8089/forum/engagement/check', { responseType: 'text' }).subscribe({
    next: (response) => console.log("Engagement check triggered successfully:", response),
    error: (err: any) => console.error("Error checking engagement:", err)
  });
}

//search
searchKeyword: string = '';
isSearching: boolean = false;

searchPosts(): void {
  if (!this.searchKeyword.trim()) {
    this.loadPosts(); // Load all posts if search is empty
    this.isSearching = false;
    return;
  }

  this.isSearching = true;
  this.searchService.searchPosts(this.searchKeyword).subscribe({
    next: (results) => {
      this.posts = results;
    },
    error: (err) => console.error('Search error:', err)
  });
}

clearSearch(): void {
  this.searchKeyword = ''; // Clear the search input
  this.isSearching = false; // Reset search flag
  this.loadPosts(); // Reload all posts
}

//filter
filterOption: 'all' | 'mine' | 'others' = 'all';

get filteredPosts() {
  if (this.filterOption === 'all') {
    return this.posts;
  } else if (this.filterOption === 'mine') {
    return this.posts.filter(post => post.authorId === this.currentUserId);
  } else { // 'others'
    return this.posts.filter(post => post.authorId !== this.currentUserId);
  }
}

//Pagination
allPosts: any[] = []; // Stores all fetched posts
currentPage: number = 0;
pageSize: number = 20;
totalPosts: number = 0;
totalPages: number = 0;

updatePage(): void {
  const start = this.currentPage * this.pageSize;
  const end = start + this.pageSize;
  this.posts = this.allPosts.slice(start, end);
}

onPageChange(page: number): void {
  if (page >= 0 && page < this.totalPages) {
    this.currentPage = page;
    this.updatePage();
  }
}

onPageSizeChange(): void {
  this.currentPage = 0;
  this.totalPages = Math.ceil(this.totalPosts / this.pageSize);
  this.updatePage();
}

//image description //

onDescribeImage(file: File) {
  this.imageDescriptionService.getImageDescription(file).subscribe(response => {
    console.log('Caption:', response.description);
    // Show the description in the UI
  });
}
/*
describeImage(post: any): void {
  // Ensure there is a valid image URL
  if (!post.mediaURL) {
    console.error('No image found for description');
    return;
  }

  // Send the image URL to the backend (using a POST request)
  this.http.post('http://localhost:5000/describe', { imageUrl: post.mediaURL })
    .subscribe(
      (response: any) => {
        console.log('Image description received:', response);
        post.imageDescription = response.description;  // Assuming the backend sends the description
      },
      (error) => {
        console.error('Error generating description:', error);
      }
    );
}*/
describeImage(post: any): void {

  if (!post.mediaURL) {
    console.error('No image found for description');
    return;
  }


  const fullImageUrl = `http://localhost:8089/forum/forum-uploads/${post.mediaURL}`;


this.http.post<any>('http://localhost:5000/generate-description', {
  imageUrl: fullImageUrl
}, { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }).subscribe(
  res => {
    post.description = res.description;
  },
  err => {
    console.error(err);
  }
);
}



}