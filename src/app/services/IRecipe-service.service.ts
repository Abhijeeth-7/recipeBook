import { Injectable } from '@angular/core';
import { RecipeDetail } from '../models/recipe.models';
import { Observable } from 'rxjs';
import { PaginationQuery } from '../models/pagination-query.model';

@Injectable({
  providedIn: 'root',
})
export abstract class IRecipeService {
  abstract getRecipes(query: any): Observable<RecipeDetail[]>;

  abstract deleteRecipe(
    recipeId: string,
    recipeImgUrl: string
  ): Observable<void>;
}
