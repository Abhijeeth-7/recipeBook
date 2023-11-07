import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import {
  RecipeDetail,
  RecipeIngredient,
  RecipeStep,
} from 'src/app/models/recipe.models';
import { UserRecipeService } from 'src/app/services/user-recipe.service';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, first, tap } from 'rxjs';
import { AuthorizationService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-manage-recipe-form',
  templateUrl: './manage-recipe-form.component.html',
})
export class ManageRecipeFormComponent implements OnInit {
  @ViewChild(FileUploadComponent)
  fileUploadComponent!: FileUploadComponent;

  recipeForm: FormGroup = this.fb.group({});
  isFormSubmitted: boolean = false;
  recipeId?: string;
  userId?: string;

  recipeDetails?: RecipeDetail;
  onSave = (recipe: RecipeDetail) => {};

  validationMessages: any = {
    title: {
      required: 'Title is required',
      minlength: 'Title should be atleast 3 characters',
      maxlength: 'Title cannot contain more than 50 characters',
    },
    image: {
      required: 'Please upload an image',
      requiredFileType: 'Please upload only jpg',
      fileUploadError: 'Error while uploading the file, try again',
    },
    hours: {
      min: 'Hours cannot be negative',
      max: 'Hours cannot be more than 24',
    },
    minutes: {
      min: 'Minutes cannot be negative',
      max: 'Minutes cannot be more than 60',
    },
    time: {
      required: 'Time is required',
    },
    servings: {
      required: 'Servings are required',
      min: 'Servings cannot be less than 1',
    },
    ingredientName: {
      required: 'Ingredient name is required',
      pattern: 'Ingredient name cannot contain numbers',
    },
    quantity: {
      required: 'Quantity is required',
      min: 'Quantity cannot be negative',
      minlength: 'Quantity should be greater than zero',
      pattern: 'Atleast one numeric value is required',
    },
    step: {
      required: 'Instruction cannot be empty',
    },
  };
  imageUrl$ = new BehaviorSubject('');

  constructor(
    private fb: FormBuilder,
    private recipeService: UserRecipeService,
    private tostrService: ToastrService,
    private modalRef: BsModalRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.recipeId = this.recipeDetails?.id;
    this.setUpRecipeForm(this.recipeDetails);
  }

  setUpRecipeForm(data?: RecipeDetail) {
    this.recipeForm = this.fb.group({
      imageUrl: [
        data ? data.imageUrl : null,
        { validators: [Validators.required] },
      ],
      title: [
        data ? data.title : '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      description: [data ? data.description : ''],
      servings: [
        data ? data.servings : 0,
        [Validators.required, Validators.min(1)],
      ],
      time: this.fb.group(
        {
          hours: [
            data ? Math.floor(data.timeInMinutes / 60) : 0,
            [Validators.min(0), Validators.max(24)],
          ],
          minutes: [
            data ? data.timeInMinutes % 60 : 0,
            [Validators.min(0), Validators.max(60)],
          ],
        },
        { validators: [this.ValidateTime] }
      ),
      ingredients: this.fb.array([]),
      steps: this.fb.array([]),
    });

    data
      ? data.ingredients.forEach((ing) => this.addIngredient(ing))
      : this.addIngredient();
    data
      ? data.steps.forEach((step) => this.addRecipeStep(step))
      : this.addRecipeStep();

    this.recipeForm.get('imageUrl')!.valueChanges.subscribe((v) => {
      this.cdr.detectChanges();
    });
  }

  ValidateTime(timeForm: AbstractControl): ValidationErrors | null {
    timeForm = timeForm as FormGroup;
    if (timeForm.valid) {
      const totalTime =
        timeForm.get('hours')?.value + timeForm.get('minutes')?.value;
      if (totalTime) return null;
      return { required: true };
    }
    return null;
  }

  addIngredient(ingredient?: RecipeIngredient) {
    let ingredientForm = this.fb.group({
      name: [ingredient ? ingredient.name : '', Validators.required],
      quantity: [
        ingredient ? ingredient.quantity : '',
        [Validators.required, Validators.min(1), Validators.pattern('[0-9]+')],
      ],
    });

    this.ingredients.push(ingredientForm);
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  addRecipeStep(step: RecipeStep | null = null) {
    let recipeStepForm = this.fb.group({
      seqNumber: [this.steps.length + 1, Validators.required],
      description: [step ? step.description : '', Validators.required],
    });

    this.steps.push(recipeStepForm);
  }

  removeRecipeStep(index: number) {
    this.steps.removeAt(index);
  }

  saveRecipe() {
    this.isFormSubmitted = true;
    if (this.recipeForm.valid) {
      const recipeFormValue = this.recipeForm.value;
      recipeFormValue.timeInMinutes =
        recipeFormValue.time.hours * 60 + recipeFormValue.time.minutes;
      recipeFormValue.likes = this.recipeDetails?.likes;
      // recipeFormValue.authorId = this.userDetailService.context.userDetails.userId;
      recipeFormValue.authorId = this.userId;
      const lastestRecipe = new RecipeDetail(recipeFormValue);
      delete lastestRecipe.id;

      this.recipeId
        ? this.updateRecipe(this.recipeId, lastestRecipe)
        : this.addRecipe(lastestRecipe);
    }
  }

  addRecipe(newRecipe: RecipeDetail) {
    this.recipeService.createRecipie(newRecipe).subscribe({
      next: (res) => {
        this.onSave(newRecipe);
        this.closeModal();
        this.tostrService.success('Recipe created successfully', 'Success');
      },
      error: (err) => {
        this.isFormSubmitted = false;
        this.tostrService.success(
          'Error while creating the recipe, Try agian',
          'Error'
        );
      },
    });
  }

  updateRecipe(recipeId: string, updatedRecipe: RecipeDetail) {
    this.recipeService.updateRecipie(recipeId, updatedRecipe).subscribe({
      next: (res) => {
        this.onSave(updatedRecipe);
        this.tostrService.success('Recipe updated successfully', 'Success');
        this.closeModal();
      },
      error: (err) => {
        this.tostrService.success(
          'Error while updating the recipe, Try agian',
          'Error'
        );
        this.isFormSubmitted = false;
      },
    });
  }

  cancel() {
    this.fileUploadComponent.onFileUploadCancelled();
    this.closeModal();
  }

  closeModal() {
    this.modalRef.hide();
  }

  get ingredients() {
    return this.recipeForm.controls['ingredients'] as FormArray;
  }

  get steps() {
    return this.recipeForm.controls['steps'] as FormArray;
  }
}
