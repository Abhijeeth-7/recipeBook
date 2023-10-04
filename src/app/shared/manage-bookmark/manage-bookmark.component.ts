import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Bookmark, BookmarkCollection } from 'src/app/models/bookmark.model';
import { BookmarkService } from 'src/app/services/bookmark.service';

@Component({
  selector: 'app-manage-bookmark',
  templateUrl: './manage-bookmark.component.html',
})
export class ManageBookmarkComponent implements OnInit {
  recipeId!: string;
  bookmark!: Bookmark;
  collectionStatus: any = {};
  selectedCollectionsCount = 0;

  constructor(
    private bookmarkService: BookmarkService,
    private toastr: ToastrService,
    private modalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    this.bookmark.collections.forEach((c) => {
      const isRecipedAdded = c.recipeIds.some((id) => id == this.recipeId);
      isRecipedAdded && this.selectedCollectionsCount++;
      this.collectionStatus[c.name] = isRecipedAdded;
    });
  }

  manageCollection(event: any, collection: BookmarkCollection) {
    if (event.target.checked) {
      this.selectedCollectionsCount++;
      collection.recipeIds.push(this.recipeId);
    } else {
      this.selectedCollectionsCount--;
      collection.recipeIds = collection.recipeIds.filter(
        (id) => id != this.recipeId
      );
    }
  }

  AddToCollection(collection: BookmarkCollection) {
    collection.recipeIds.push(this.recipeId);
  }

  RemoveFromCollection(collection: BookmarkCollection) {
    collection.recipeIds = collection.recipeIds.filter(
      (id) => id != this.recipeId
    );
  }

  updateCollections() {
    this.bookmarkService.updateBookmark(this.bookmark).subscribe({
      next: (res) => {
        this.closeModal();
        this.toastr.success(
          `Recipe has been ${
            !!this.selectedCollectionsCount
              ? 'added to selected'
              : 'removed from'
          } collections`,
          'Success'
        );
      },
      error: () =>
        this.toastr.error(
          `Error while  ${
            !!this.selectedCollectionsCount
              ? 'adding recipe to'
              : 'removing recipe from'
          } selected collections`,
          'Error'
        ),
    });
  }

  closeModal() {
    this.modalRef.hide();
  }
}
