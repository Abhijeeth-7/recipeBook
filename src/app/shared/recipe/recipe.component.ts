import {
  Component,
  ElementRef,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { RecipeDetail } from '../../models/recipe.models';
import { BookmarkService } from '../../services/bookmark.service';
import { ManageRecipeFormComponent } from '../manage-recipe-form/manage-recipe-form.component';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ManageBookmarkComponent } from '../manage-bookmark/manage-bookmark.component';
import { Bookmark } from 'src/app/models/bookmark.model';
import { IRecipeService } from 'src/app/services/IRecipe-service.service';
import {
  combineLatest,
  debounceTime,
  forkJoin,
  fromEvent,
  map,
  tap,
} from 'rxjs';
import { LikeService } from 'src/app/services/like.service';
import { ToastrService } from 'ngx-toastr';
import { FirebaseAPiService } from 'src/app/services/firebase-api.service';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationService } from 'src/app/services/auth.service';
import { PaginationQuery } from 'src/app/models/pagination-query.model';
import { UserDetailService } from 'src/app/services/user-detail.service';

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        margin: 10px 0;

        & > * {
          flex: 1;
          display: flex;
          overflow: auto;
        }
      }
    `,
  ],
})
export class RecipeComponent implements OnInit, AfterViewInit {
  @Input() recipeCards: RecipeDetail[] = [];
  @Input() serverSideSearch: boolean = true;
  @Input() recipeIds: string[] = [];

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  authorImgUrl: any;
  authorName: any;
  currentUser: any;
  @ViewChild('likeButton') set likeButton(likeButtonRef: ElementRef) {
    if (likeButtonRef) {
      this.setLikeButtomDebounce(likeButtonRef);
    }
  }

  isliked: boolean = false;
  searchTerm: string = '';
  recipeDetail: RecipeDetail | undefined;
  recipeList: Array<RecipeDetail> = [];
  filteredRecipeList: Array<RecipeDetail> = [];
  userId: string = '';
  likeId: string | null = null;
  bookmark: Bookmark | undefined;
  currentPage: number = 0;
  isRequestInProgress: boolean = false;
  isSortedAscending: boolean = true;
  selectedTime: string = 'all';
  isMobileView: boolean = false;
  isRecipeListShown: boolean = true;
  TimeFilterOptions = [
    { value: 'all', title: 'All' },
    { value: '<=30', title: '30 mins or less' },
    { value: '<=60', title: '1 hour or less' },
    { value: '<=90', title: '1.5 hour or less' },
    { value: '<=120', title: '2 hours or less' },
    { value: '<=150', title: '2.5 hours or less' },
    { value: '<=180', title: '3 hours or less' },
    { value: '>=180', title: 'More than 3 hours' },
  ];

  constructor(
    private recipieService: IRecipeService,
    private likeService: LikeService,
    private bookmarkService: BookmarkService,
    private bsModalService: BsModalService,
    private toastrService: ToastrService,
    private activatedRoute: ActivatedRoute,
    private userDetailService: UserDetailService
  ) {}

  ngOnInit(): void {
    this.setUpMediaChangeListener();
    this.activatedRoute.parent?.params.subscribe((params) => {
      this.userId = params['userId'];
      this.userDetailService.currentUser.subscribe((user: any) => {
        this.currentUser = user;
        this.userId = this.userId ?? user?.userId;
        if (this.userId) {
          this.userBookmarks();
          this.getRecipes();
        }
      });
    });
  }

  ngAfterViewInit() {
    fromEvent(this.searchInput.nativeElement, 'input')
      .pipe(
        debounceTime(600),
        map((event) => (<HTMLInputElement>event.target)?.value)
      )
      .subscribe((searchTerm) => {
        this.searchTerm = searchTerm;
        this.currentPage = 0;
        this.recipeList = [];
        this.filteredRecipeList = [];
        this.getRecipes();
      });
  }

  setUpMediaChangeListener() {
    const breakpoint = window.matchMedia('(max-width: 849px)');
    this.isMobileView = window.innerWidth <= 850;

    // Listen for changes
    breakpoint.addEventListener('change', (event) => {
      this.isMobileView = event.matches;
      console.log('Mobile View', this.isMobileView);
    });
  }

  toggleRecipeListView() {
    this.isRecipeListShown = !this.isRecipeListShown;
    this.recipeDetail = undefined;
  }

  userBookmarks() {
    this.bookmarkService.getBookmark(this.userId).subscribe((bookmark) => {
      this.bookmark = new Bookmark(bookmark);
    });
  }

  isRecipeBookmarked(recipeId: string) {
    return !!this.bookmark?.collections.some((c) =>
      c.recipeIds.includes(recipeId)
    );
  }

  getRecipes() {
    if (this.isRequestInProgress) return;

    this.isRequestInProgress = true;
    const paginationQuery = new PaginationQuery({
      searchTerm: this.searchTerm,
      pageNumber: this.currentPage + 1,
      pageSize: 5,
      sort: this.isSortedAscending ? 'asc' : 'desc',
      timeFilterValue: this.selectedTime == 'all' ? null : this.selectedTime,
      queryData: {
        recipeIds: this.recipeIds,
        authorId: this.userId,
      },
    });

    this.recipieService.getRecipes(paginationQuery).subscribe((data) => {
      this.recipeList.push(...data);
      this.recipeList.forEach(
        (recipe) => (recipe.isBookmarked = this.isRecipeBookmarked(recipe.id!))
      );
      this.filteredRecipeList.push(...data);
      if (this.filteredRecipeList.length && !this.isMobileView) {
        this.openRecipeDetails(this.filteredRecipeList[0].id);
      }
      this.currentPage++;
      this.isRequestInProgress = false;
    });
  }

  toggleSort() {
    this.isSortedAscending = !this.isSortedAscending;
    this.recipeList = [];
    this.filteredRecipeList = [];
    this.currentPage = 0;
    this.getRecipes();
  }

  filterRecipesByTime() {
    this.filteredRecipeList = [];
    this.recipeList = [];
    this.currentPage = 0;
    this.getRecipes();
  }

  setLikeButtomDebounce(ref: ElementRef) {
    fromEvent(ref.nativeElement, 'click')
      .pipe(
        tap((_) => {
          this.isliked = !this.isliked;
          this.recipeDetail!.likes += 1 * (this.isliked ? 1 : -1);
        }),
        debounceTime(1000)
      )
      .subscribe((_) => {
        this.toggleLike();
      });
  }

  toggleLike() {
    if (this.isliked && !this.likeId) {
      this.likeService
        .setLike(
          this.recipeDetail?.id!,
          this.recipeDetail?.authorId!,
          this.userId
        )
        .subscribe((docRef) => {
          this.likeId = docRef?.id;
        });
    } else if (this.likeId) {
      this.likeService
        .removeLike(this.likeId, this.recipeDetail?.id!)
        .subscribe((result) => {
          this.likeId = null;
          this.recipeDetail!.likes++;
        });
    }
  }

  increaseServings() {
    this.modifyIngredinetQunatity(1);
    this.recipeDetail && this.recipeDetail.servings++;
  }

  decreaseServings() {
    if (this.recipeDetail!.servings > 1) {
      this.modifyIngredinetQunatity(-1);
      this.recipeDetail && this.recipeDetail.servings--;
    }
  }

  modifyIngredinetQunatity(factor: number) {
    this.recipeDetail?.ingredients.forEach((i) => {
      const quantity = +(i.quantity.match(/[0-9][.0-9]*/g)?.join('') || 1);
      const units = i.quantity.match(/[a-zA-Z]/g)?.join('') || '';
      const intialQuantity = quantity / this.recipeDetail?.servings!;
      i.quantity = `${(quantity + intialQuantity * factor).toFixed(
        2
      )} ${units}`;
    });
  }

  openRecipeDetails(recipeId?: string) {
    this.isRecipeListShown = false;
    if (recipeId) {
      this.recipeDetail = this.filteredRecipeList.find(
        (r) => r.id === recipeId
      );
      forkJoin([]);
      this.userDetailService
        .getUserByAppId(this.recipeDetail!.authorId)
        .subscribe((user) => {
          this.authorName = user.name;
          this.authorImgUrl = user.profileImageUrl;
        });
      this.likeService
        .getUserLike(this.userId, recipeId)
        .subscribe((data: any) => {
          this.likeId = data[0]?.id;
          this.isliked = !!this.likeId;
        });
    }
  }

  openAddToBookmarkModal() {
    const modalConfig: ModalOptions = {
      class: 'modal-sm',
      initialState: {
        recipeId: this.recipeDetail?.id,
        bookmark: this.bookmark,
      },
    };
    this.bsModalService.show(ManageBookmarkComponent, modalConfig);
  }

  openAddRecipeModal() {
    this.bsModalService.show(ManageRecipeFormComponent, {
      class: 'modal-800',
      initialState: {
        userId: this.userId,
        onSave: (newRecipe) => {
          this.recipeList.push(newRecipe);
          this.recipeDetail = this.filteredRecipeList[0];
        },
      },
    });
  }

  editRecipe() {
    const modalConfig: ModalOptions = {
      class: 'modal-800',
      backdrop: 'static',
      ignoreBackdropClick: true,
      initialState: {
        userId: this.userId,
        recipeDetails: this.recipeDetail,
        onSave: (recipeDetail: RecipeDetail) => {
          recipeDetail.id = this.recipeDetail?.id;
          let ind = this.recipeList.findIndex((r) => r.id === recipeDetail.id);
          this.recipeList.splice(ind, 1, recipeDetail);
          ind = this.filteredRecipeList.findIndex(
            (r) => r.id === recipeDetail.id
          );
          this.filteredRecipeList.splice(ind, 1, recipeDetail);
          this.recipeDetail = recipeDetail;
        },
      },
    };
    this.bsModalService.show(ManageRecipeFormComponent, modalConfig);
  }

  deleteRecipe() {
    const modalConfig: ModalOptions = {
      class: 'modal-sm',
      initialState: {
        title: `Delete ${this.recipeDetail?.title}`,
        message: `Are you sure you want to delete "${this.recipeDetail?.title}" recipe ?`,
        confirmButtonText: `Yes, Delete`,
        onConfirm: (args: any) => {
          this.recipieService
            .deleteRecipe(this.recipeDetail?.id!, this.recipeDetail?.imageUrl!)
            .subscribe({
              next: (res) => {
                this.recipeList = this.recipeList.filter(
                  (r) => r.id !== this.recipeDetail?.id
                );
                this.filteredRecipeList = this.filteredRecipeList.filter(
                  (r) => r.id !== this.recipeDetail?.id
                );
                this.recipeDetail = this.filteredRecipeList[0];
                this.toastrService.success(
                  'Success',
                  'Recipe deleted succefully'
                );
              },
              error: (error) => {
                this.toastrService.error(
                  'Error',
                  'Error while deleting the recipe, Try again'
                );
              },
            });
        },
      },
    };
    this.bsModalService.show(ConfirmDialogComponent, modalConfig);
  }
}
