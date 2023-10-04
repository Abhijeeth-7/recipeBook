import { Injectable } from '@angular/core';
import { query, where } from '@angular/fire/firestore';
import { FirebaseAPiService } from './firebase-api.service';

@Injectable({
  providedIn: 'root',
})
export class LikeService extends FirebaseAPiService {
  getUserLike(userId: string, recipeId: string) {
    const likesRef = this.getCollectionRef(['Likes']);
    const userLikeQuery = query(
      likesRef,
      where('likedBy', '==', userId),
      where('recipeId', '==', recipeId)
    );
    return this.getDocs(userLikeQuery);
  }

  setLike(recipeId: string, authorId: string, likedBy: string) {
    const likesCollectionRef = this.getCollectionRef(['Likes']);
    const newlikeObject = { authorId, recipeId, likedBy };
    const recipeRef = this.getDocRef(['Recipes', recipeId]);

    return this.runTransaction(async (transaction) => {
      const recipeDoc = await transaction.get(recipeRef);
      if (!recipeDoc.exists()) return;

      const updatesLikesCount = recipeDoc.data()['likes'] + 1;
      transaction.update(recipeRef, { likes: updatesLikesCount });
      this.transactionResult = this.addDoc(
        likesCollectionRef,
        newlikeObject
      ).subscribe();
    });
  }

  removeLike(likeId: string, recipeId: string) {
    const recipeRef = this.getDocRef(['Recipes', recipeId]);

    return this.runTransaction(async (transaction) => {
      const recipeDoc = await transaction.get(recipeRef);
      if (!recipeDoc.exists()) return;

      const updatesLikesCount = recipeDoc.data()['likes'] - 1;
      transaction.update(recipeRef, { likes: updatesLikesCount });

      this.deleteDoc(['Likes', likeId]);
      this.transactionResult = true;
    });
  }
}
