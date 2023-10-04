import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { concatMap } from 'rxjs';
import { Bookmark, BookmarkCollection } from 'src/app/models/bookmark.model';
import { IRecipeService } from 'src/app/services/IRecipe-service.service';
import { BookmarkRecipeService } from 'src/app/services/bookmark-recipe.service';
import { BookmarkService } from 'src/app/services/bookmark.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  providers: [
    {
      provide: IRecipeService,
      useClass: BookmarkRecipeService,
    },
  ],
})
export class BookmarkComponent implements OnInit {
  userId!: string;
  bookmark!: Bookmark;
  selectedCollection: BookmarkCollection | null = null;
  newCollectionName: string = '';
  isAddingCollection: boolean = false;
  editingCollectionAt: number | null = null;
  selectedRecipeIds: string[] = [];

  constructor(
    private bookmarkService: BookmarkService,
    private toastrService: ToastrService,
    private bsModalService: BsModalService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.parent?.params.subscribe((params) => {
      const userId = params['userId'];
      this.getBookmarks(userId);
    });
  }

  getBookmarks(userId: string) {
    this.bookmarkService.getBookmark(userId).subscribe((bookmark) => {
      if (bookmark.userId) {
        this.bookmark = new Bookmark(bookmark);
        return;
      }
      this.bookmark = new Bookmark({ bookmarkId: bookmark.bookmarkId, userId });
    });
  }

  viewCollection(selectedCollection: BookmarkCollection) {
    if (selectedCollection.recipeCount) {
      this.selectedCollection = selectedCollection;
      this.selectedRecipeIds = selectedCollection.recipeIds;
    } else {
      this.toastrService.info(
        'Please add some recipes to the collection',
        'Empty collection'
      );
    }
  }

  addNewCollection() {
    this.isAddingCollection = true;
  }

  updateCollectionName(index: number) {
    this.editingCollectionAt = index;
    this.newCollectionName = this.bookmark.collections[index].name;
  }

  createNewCollection() {
    if (!this.newCollectionName) {
      this.toastrService.warning('Please enter collection name', 'Warning');
      return;
    }
    let createCollectionApiCall: any;
    const newCollection = new BookmarkCollection({
      name: this.newCollectionName,
    });
    if (!this.bookmark.bookmarkId) {
      const newBookmark = this.bookmark;
      delete newBookmark['bookmarkId'];
      newBookmark.collections.push(newCollection);
      createCollectionApiCall =
        this.bookmarkService.createBookmark(newBookmark);
    } else {
      createCollectionApiCall = this.bookmarkService.createNewCollection(
        this.bookmark.bookmarkId!,
        newCollection
      );
    }
    createCollectionApiCall.subscribe({
      next: (res: any) => {
        if (!this.bookmark.bookmarkId) {
          this.bookmark.bookmarkId = res.id;
        } else {
          this.bookmark.collections.push(newCollection);
        }
        this.toastrService.success(
          `"${this.newCollectionName}" Collection has been created successfully`,
          'Success'
        );
        this.newCollectionName = '';
      },
      error: () =>
        this.toastrService.error(
          'Error while creating new collection, Try again',
          'Error'
        ),
      complete: () => {
        this.isAddingCollection = false;
      },
    });
  }

  editCollectionName(collection: BookmarkCollection) {
    if (!this.newCollectionName) {
      this.toastrService.warning('Please enter collection name', 'Warning');
      return;
    }
    this.bookmark.collections[this.editingCollectionAt!].name =
      this.newCollectionName;
    this.editingCollectionAt = null;
    this.bookmarkService.updateCollectionName(this.bookmark).subscribe({
      next: () => {
        this.toastrService.success(
          `Collection name has been updated successfully`,
          'Success'
        );
      },
      error: () => {
        this.editingCollectionAt = null;
        this.toastrService.error(
          'Error while creating new collection, Try again',
          'Error'
        );
      },
    });
  }

  openConfirmationModal(collection: BookmarkCollection) {
    const modalConfig: ModalOptions = {
      initialState: {
        title: `Delete "${collection.name}" Collection`,
        message: `You are about to delete "${collection.name}" from your bookmarks, Are you sure you want to procced?`,
        confirmButtonText: `Delete`,
        confirmButtonClass: 'btn-danger',
        onConfirm: () =>
          this.deleteCollection(this.bookmark.bookmarkId!, collection),
      },
    };

    this.bsModalService.show(ConfirmDialogComponent, modalConfig);
  }

  deleteCollection(bookmarkId: string, collection: BookmarkCollection) {
    this.bookmarkService.deleteCollection(bookmarkId, collection).subscribe({
      next: (res) => {
        this.bookmark.collections = this.bookmark.collections.filter(
          (c) => c.name != collection.name
        );
        this.toastrService.success(
          `"${collection.name}" Collection has been deleted successfully`,
          'Success'
        );
      },
      error: () =>
        this.toastrService.error(
          `Error while deleteing "${collection.name}", Try again`,
          'Error'
        ),
    });
  }
}
