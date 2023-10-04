import { Component, OnInit } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { AuthorizationService } from './services/auth.service';
import { UserDetailService } from './services/user-detail.service';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ManageRecipeFormComponent } from './shared/manage-recipe-form/manage-recipe-form.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoggedIn$: Observable<boolean> = of(false);
  userId: string | undefined;
  userImageUrl: string | null | undefined;
  userName: string | null | undefined;

  constructor(
    private router: Router,
    private authService: AuthorizationService,
    private userDetailService: UserDetailService,
    private bsModalService: BsModalService
  ) {
    this.userDetailService.currentUser.subscribe((user: any) => {
      if (user) {
        this.userId = user?.userId;
        this.userImageUrl = user?.profileImageUrl;
        this.userName = user?.name;
      } else {
      }
    });
    this.isLoggedIn$ = this.authService.currentUser$.pipe(
      map((user) => !!user),
      tap((isLoggedIn) => {
        !isLoggedIn && this.router.navigate(['login']);
      })
    );
  }

  ngOnInit() {}

  openAddRecipeModal() {
    this.bsModalService.show(ManageRecipeFormComponent, {
      class: 'modal-800',
      initialState: {
        userId: this.userId,
        onSave: (newRecipe) => {},
      },
    });
  }
  logout() {
    this.authService.logout();
  }
}
