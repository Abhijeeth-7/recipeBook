import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookmarkComponent } from './bookmark/bookmark.component';
import { RouterModule, Routes } from '@angular/router';
import { RecipeComponent } from '../shared/recipe/recipe.component';
import { SharedModule } from '../shared/shared.module';
import { UserDetailComponent } from './user-detail/user-detail.component';

const routes: Routes = [
  {
    path: ':userId',
    component: UserDetailComponent,
    children: [
      { path: '', redirectTo: 'recipes', pathMatch: 'full' },
      { path: 'recipes', component: RecipeComponent },
      {
        path: 'bookmarks',
        component: BookmarkComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [UserDetailComponent, BookmarkComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class UserModule {}
