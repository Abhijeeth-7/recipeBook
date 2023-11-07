import { Injectable } from '@angular/core';
import { UserDetailService } from './user-detail.service';
import { BookmarkService } from './bookmark.service';
import { Bookmark, BookmarkCollection } from '../models/bookmark.model';
import { User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  constructor(
    private userDetailService: UserDetailService,
    private bookmarkService: BookmarkService
  ) {}

  initateUserOnBoarding(userState: User) {
    const appUserId = crypto.randomUUID();
    this.createNewUser(userState, appUserId);
    this.createDefaultBookmark(appUserId);
  }

  createNewUser(userState: User, appUserId: string) {
    this.userDetailService.createNewUser(userState, appUserId);
  }

  createDefaultBookmark(userId: string) {
    const bookmark = new Bookmark({ userId });
    bookmark.collections.push(new BookmarkCollection({ name: 'default' }));
    this.bookmarkService.createBookmark(bookmark).subscribe();
  }
}
