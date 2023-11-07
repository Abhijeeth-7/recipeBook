import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  distinctUntilChanged,
  first,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Auth, User, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FirebaseAPiService } from './firebase-api.service';
import { UserDetailService } from './user-detail.service';
import { BookmarkService } from './bookmark.service';
import { Bookmark, BookmarkCollection } from '../models/bookmark.model';
import { OnboardingService } from './onboarding.service';
import { LoaderService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  currentUser$: Observable<User | null>;

  pictureUrl$: Observable<string | null> = of('');
  sessionExpirationTimer: any;

  constructor(
    private auth: Auth,
    private firebaseAPIService: FirebaseAPiService,
    private userDetailService: UserDetailService,
    private onboardingService: OnboardingService,
    private loaderSerive: LoaderService,
    private router: Router
  ) {
    this.currentUser$ = authState(this.auth).pipe(
      tap((user) => {
        if (user) {
          this.initiateUserSession();
          this.setCurrentUserDetails(user?.uid!);
        }
      })
    );
  }

  getAuth() {
    return this.auth;
  }

  getCurrentUserId() {
    return this.auth.currentUser?.uid;
  }

  setCurrentUserDetails(userId: string) {
    this.userDetailService.setCurrentUser(userId);
  }

  onLoginSuccessful(_result: boolean) {
    this.loaderSerive.showLoader();
    authState(this.auth)
      .pipe(first())
      .subscribe((userState) => {
        if (userState) {
          this.checkNewUser(userState);
          this.initiateUserSession();
          this.setCurrentUserDetails(userState?.uid!);
          this.loaderSerive.hideLoader();
          this.router.navigateByUrl('/home');
        }
      });

    return true;
  }

  private checkNewUser(userState: User) {
    this.firebaseAPIService
      .getDocByRef(['Users', userState.uid])
      .subscribe((doc) => {
        if (!doc.userId) {
          this.onboardingService.initateUserOnBoarding(userState);
        }
      });
  }

  private initiateUserSession() {
    let sessionInfo = localStorage.getItem('sessionInfo');
    let expiresIn = 2 * 60 * 60 * 1000; //2 hours
    if (sessionInfo) {
      expiresIn = this.getExpirationDuration(JSON.parse(sessionInfo));
    } else {
      sessionInfo = JSON.stringify({
        createdAt: Date.now(),
        expiresAt: Date.now() + 2 * 60 * 60 * 1000,
      });
      localStorage.setItem('sessionInfo', sessionInfo);
    }
    this.setLogoutTimer(expiresIn);
  }

  private getExpirationDuration(sessionInfo: any) {
    return sessionInfo.expiresAt - Date.now();
  }

  private setLogoutTimer(expiresIn: number) {
    this.sessionExpirationTimer = setTimeout(() => {
      this.logout();
      localStorage.clear();
    }, expiresIn);
  }

  private clearLogoutTimer() {
    if (this.sessionExpirationTimer) {
      clearTimeout(this.sessionExpirationTimer);
      this.sessionExpirationTimer = null;
    }
  }

  logout() {
    this.auth.signOut();
    this.clearLogoutTimer();
    this.router.navigateByUrl('/login');
  }
}
