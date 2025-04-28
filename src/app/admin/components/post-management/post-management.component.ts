import { Component, OnInit } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { HttpClient } from '@angular/common/http';
import { SearchService } from 'src/app/services/search.service';
import { BadWordService } from 'src/app/services/bad-word.service';

@Component({
  selector: 'app-post-management',
  templateUrl: './post-management.component.html',
  styleUrls: ['./post-management.component.css']
})


export class PostManagementComponent implements OnInit {
  // Reuse existing properties from PostListComponent
  posts: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  totalPosts: number = 0;
  totalPages: number = 0;
  allPosts: any[] = [];


  searchKeyword: string = '';
  isSearching: boolean = false;
  filterOption: 'all' | 'reported' = 'all';
  
  editingPost: any = null;

  constructor(
    private postService: PostService,
    private searchService: SearchService,
    private http: HttpClient,
    private badWordService: BadWordService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    this.loadBannedWords();
  }

  /*loadPosts(page: number = 0, size: number = this.pageSize): void {
    this.postService.getAllPosts().subscribe({
      next: (response: any) => {
        this.posts = response.content;
        this.currentPage = response.number;
        this.totalPages = response.totalPages;
        this.totalPosts = response.totalElements;
      },
      error: (err) => console.error('Error loading posts:', err)
    });
  }*/
    loadPosts(): void {
      this.postService.getAllPosts().subscribe({
        next: (response: any[]) => {
          this.allPosts = response.map((post: any) => ({
            ...post,
            filteredContent: this.filterContent(post.content),
            reactions: post.reactions || [],
            isTrending: (post.reactions?.length || 0) > 3
          }));
    
          this.totalPosts = this.allPosts.length;
          this.totalPages = Math.ceil(this.totalPosts / this.pageSize);
          this.updatePage();
        },
        error: (err) => console.error('Error loading posts:', err)
      });
    }
    
  // Reuse your existing search and filter methods
  searchPosts(): void {
    if (!this.searchKeyword.trim()) {
      this.loadPosts();
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
    this.searchKeyword = '';
    this.isSearching = false;
    this.loadPosts();
  }

  get filteredPosts() {
    if (this.filterOption === 'all') {
      return this.posts;
    } else { // 'reported'
      return this.posts.filter(post => post.reportCount > 0);
    }
  }

  // Admin-specific methods

  deletePost(postId: number): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.http.delete(`http://localhost:8081/admin/posts/${postId}`)
        .subscribe({
          next: () => {
            this.posts = this.posts.filter(post => post.postID !== postId);
          },
          error: (err) => console.error('Delete error:', err)
        });
    }
  }


  //Pagination

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

updatePage(): void {
  const start = this.currentPage * this.pageSize;
  const end = start + this.pageSize;
  this.posts = this.allPosts.slice(start, end);
}

//bad-word
bannedWords: string[] = [];
newBannedWord = '';
showBannedWordsPanel = false;

loadBannedWords(): void {
  this.bannedWords = this.badWordService.getBannedWords();
}

addBannedWord(): void {
  if (this.newBannedWord.trim()) {
    this.badWordService.addBannedWord(this.newBannedWord.trim());
    this.newBannedWord = '';
    this.loadBannedWords();
  }
}

removeBannedWord(word: string): void {
  if (confirm(`Remove "${word}" from banned words?`)) {
    this.badWordService.removeBannedWord(word);
    this.loadBannedWords();
  }
}

toggleBannedWordsPanel(): void {
  this.showBannedWordsPanel = !this.showBannedWordsPanel;
}
  
filterContent(content: string): string {
  const bannedWords = this.badWordService.getBannedWords();
  
  bannedWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    content = content.replace(regex, '*'.repeat(word.length));
  });
  
  return content;
}

}