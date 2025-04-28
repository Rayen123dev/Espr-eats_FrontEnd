export enum ReactionType {
    LIKE = 'LIKE',
    LOVE = 'LOVE',
    LAUGH = 'LAUGH',
    ANGRY = 'ANGRY',
    DISLIKE = 'DISLIKE',
  }

  
  export interface Reaction {
    reactionid: number;
    createdAt: Date;
    emoji: ReactionType;
    authorId: number;
    postId: number;
    userId: number;
  }
