import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { UserDetailService } from '../services/user-detail.service';
import { map, tap } from 'rxjs';

export const allowCurrentUserGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const userDetailService = inject(UserDetailService);
  const router = inject(Router);
  const activatedRoute = inject(ActivatedRoute);
  return userDetailService.currentUser.pipe(
    map((user: any) => user?.userId == route.parent?.params['userId']),
    tap(
      (isValid) =>
        !isValid && router.navigate(['../'], { relativeTo: activatedRoute })
    )
  );
};

//experimental
@Injectable({ providedIn: 'root' })
export class authGaurds {
  constructor(
    private userDetailService: UserDetailService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  CanActivate(): CanActivateFn {
    return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      return this.userDetailService.currentUser.pipe(
        map((user: any) => user?.userId == route.parent?.params['userId']),
        tap(
          (isValid) =>
            !isValid &&
            this.router.navigate(['../'], { relativeTo: this.route })
        )
      );
    };
  }
}
