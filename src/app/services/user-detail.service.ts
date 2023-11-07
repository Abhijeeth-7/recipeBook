import { Injectable } from '@angular/core';
import { where } from 'firebase/firestore';
import { FirebaseAPiService } from './firebase-api.service';
import { query } from '@angular/fire/firestore';
import {
  BehaviorSubject,
  Subject,
  first,
  forkJoin,
  map,
  pipe,
  switchMap,
} from 'rxjs';
import { User } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class UserDetailService extends FirebaseAPiService {
  private _currentUser = new BehaviorSubject(null);

  getUser(authId: string) {
    return this.getDocByRef(['Users', authId]);
  }

  getUserByAppId(appUserId: string) {
    const userCollectiobRef = this.getCollectionRef(['Users']);
    const docQuery = query(userCollectiobRef, where('userId', '==', appUserId));
    return this.getDoc(docQuery);
  }

  getUserStats(userId: string) {
    const recipesQuery = query(
      this.getCollectionRef(['Recipes']),
      where('authorId', '==', userId)
    );
    const likesQuery = query(
      this.getCollectionRef(['Likes']),
      where('authorId', '==', userId)
    );
    return forkJoin([
      this.getCount(likesQuery),
      this.getCount(recipesQuery),
    ]).pipe(map((data) => ({ likesCount: data[0], recipesCount: data[1] })));
  }

  createNewUser(userState: User, appUserId: string) {
    this.setDoc(['Users', userState.uid], {
      userId: appUserId,
      name: userState.displayName,
      bio: '',
      profileImageUrl: userState.photoURL,
    }).subscribe();
  }

  updateUserDetails(userDetails: any) {
    const userCollectionRef = this.getCollectionRef(['Users']);
    const docQuery = query(
      userCollectionRef,
      where('userId', '==', userDetails.userId)
    );
    return this.getDoc(docQuery).pipe(
      switchMap((doc) => {
        const updateObj = JSON.parse(JSON.stringify(userDetails));
        return this.updateDoc(this.getDocRef(['Users', doc.id]), updateObj);
      })
    );
  }

  get currentUser() {
    return this._currentUser.asObservable();
  }

  setCurrentUser(userId: string) {
    return this.getUser(userId)
      .pipe(first())
      .subscribe((userDetails) => this._currentUser.next(userDetails));
  }
}
