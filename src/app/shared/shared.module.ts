import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeComponent } from './recipe/recipe.component';
import { ManageRecipeFormComponent } from './manage-recipe-form/manage-recipe-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { timePipe } from './Pipes/time.pipe';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { BsDropdownConfig, BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ManageBookmarkComponent } from './manage-bookmark/manage-bookmark.component';
import { ValidationMessageComponent } from './validation-message/validation-message.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    RecipeComponent,
    ManageRecipeFormComponent,
    ConfirmDialogComponent,
    FileUploadComponent,
    timePipe,
    ManageBookmarkComponent,
    ValidationMessageComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    ProgressbarModule.forRoot(),
    TooltipModule.forRoot(),
    ToastrModule.forRoot(),
    BsDropdownModule.forRoot(),
    InfiniteScrollModule,
    RouterModule,
  ],
  exports: [
    RecipeComponent,
    ManageRecipeFormComponent,
    ConfirmDialogComponent,
    timePipe,
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule,
    InfiniteScrollModule,
    ValidationMessageComponent,
    TooltipModule,
  ],
  providers: [
    {
      provide: BsDropdownConfig,
      useValue: {
        stopOnClickPropagation: true,
        isAnimated: true,
        autoClose: true,
      },
    },
  ],
})
export class SharedModule {}
