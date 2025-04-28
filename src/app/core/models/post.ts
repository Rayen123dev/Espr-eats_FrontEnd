import { User } from "./user";

  /*export interface Post {
    postID: number;
    content: string;
    createdAt: Date;
    mediaUrl?: string;
    authorId: number;
    parentId?: number;
    replies?: Post[];
    author?: User;
    authorUsername: string;
  }*/

export interface Post {
  postID: number;
  content: string;
  mediaURL?: string;
  createdAt: string;
  authorId: number;
  parentId?: number;
  replies?: Post[];
  author?: User;
  authorUsername: string;
  editing?: boolean;
  updatedContent?: string;
  updatedMediaUrl?: string;
  showReplies?: boolean; // For UI toggling
  isReplying?: boolean; // For UI state
}