import { Injectable } from '@angular/core';
import { arrayRemove, arrayUnion, query, where } from '@angular/fire/firestore';
import { Bookmark, BookmarkCollection } from '../models/bookmark.model';
import { FirebaseAPiService } from './firebase-api.service';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService extends FirebaseAPiService {
  getBookmark(userId: string) {
    const bookmarkCollectionRef = this.getCollectionRef(['Bookmarks']);
    const bookmarkQuery = query(
      bookmarkCollectionRef,
      where('userId', '==', userId)
    );
    return this.getDoc<Bookmark>(bookmarkQuery);
  }

  createBookmark(bookmark: Bookmark) {
    return this.addDoc(this.getCollectionRef(['Bookmarks']), bookmark);
  }

  createNewCollection(bookmarkId: string, collection: BookmarkCollection) {
    const bookmarkDocRef = this.getDocRef(['Bookmarks', bookmarkId]);
    const updateObj = {
      collections: arrayUnion(JSON.parse(JSON.stringify(collection))),
    };
    return this.updateDoc(bookmarkDocRef, updateObj);
  }

  updateCollectionName(bookmark: Bookmark) {
    const bookmarkDocRef = this.getDocRef(['Bookmarks', bookmark.bookmarkId!]);
    const updateObj = JSON.parse(JSON.stringify(bookmark));
    return this.updateDoc(bookmarkDocRef, updateObj);
  }

  deleteCollection(bookmarkId: string, collection: BookmarkCollection) {
    const bookmarkDocRef = this.getDocRef(['Bookmarks', bookmarkId!]);
    const updateObj = {
      collections: arrayRemove(JSON.parse(JSON.stringify(collection))),
    };
    return this.updateDoc(bookmarkDocRef, updateObj);
  }

  updateBookmark(bookmark: Bookmark) {
    const bookmarkDocRef = this.getDocRef(['Bookmarks', bookmark.bookmarkId!]);
    const updateObj = JSON.parse(JSON.stringify(bookmark));
    return this.updateDoc(bookmarkDocRef, updateObj);
  }
}
