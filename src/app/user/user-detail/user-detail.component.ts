import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IRecipeService } from 'src/app/services/IRecipe-service.service';
import { AuthorizationService } from 'src/app/services/auth.service';
import { RecipeService } from 'src/app/services/recipeService';
import { UserDetailService } from 'src/app/services/user-detail.service';
import { UserRecipeService } from 'src/app/services/user-recipe.service';
import { FormControl, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, of } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  providers: [
    {
      provide: IRecipeService,
      useClass: UserRecipeService,
    },
  ],
})
export class UserDetailComponent implements OnInit {
  userDetails: any;
  currentUser: any;
  userDetailsForm: FormGroup = new FormGroup({});
  isFormSubmitted: boolean = false;
  @ViewChild('userDetailsModal') userDetailsModal: any;
  modalRef: BsModalRef | undefined;

  validationMessages = {
    name: {
      required: 'Name is required',
    },
  };
  constructor(
    private userDetailService: UserDetailService,
    private authService: AuthorizationService,
    private activatedRoute: ActivatedRoute,
    private bsModalService: BsModalService,
    private tostrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.userDetailService.currentUser.subscribe((user) => {
      this.currentUser = user;
      this.userDetailsForm = new FormGroup({
        name: new FormControl(this.currentUser.name ?? ''),
        bio: new FormControl(this.currentUser.bio ?? ''),
      });
    });
    this.activatedRoute.params.subscribe((params) => {
      const userId = params['userId'];
      this.getUserDetails(userId);
      this.getUserStats(userId);
    });
  }

  getUserDetails(userId: string) {
    this.userDetailService.getUserByAppId(userId).subscribe((data) => {
      this.userDetails = data;
    });
  }

  getUserStats(userId: string) {
    this.userDetailService.getUserStats(userId).subscribe((data) => {
      this.userDetails.totalLikes = data.likesCount;
      this.userDetails.totalRecipes = data.recipesCount;
    });
  }

  openUserDetailsModal() {
    this.modalRef = this.bsModalService.show(this.userDetailsModal, {
      class: 'modal-left modal-400',
    });
  }

  updateUserDetails() {
    this.isFormSubmitted = true;
    if (this.userDetailsForm.valid) {
      this.currentUser.name = this.userDetailsForm.value.name;
      this.currentUser.bio = this.userDetailsForm.value.bio;
      this.userDetailService
        .updateUserDetails(this.currentUser)
        .subscribe((_) => {
          this.closeModal();
          this.userDetails = this.currentUser;
          this.tostrService.success(
            'User details have been updated successfully',
            'Success'
          );
        });
    }
  }

  closeModal() {
    this.modalRef!.hide();
  }

  get isCurrentUserProfile() {
    return this.userDetails?.userId == this.currentUser?.userId;
  }
}
