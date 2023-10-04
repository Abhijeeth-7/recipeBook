import { Injectable } from '@angular/core';
import { IRecipeService } from './IRecipe-service.service';
import { documentId, query, where } from '@angular/fire/firestore';
import { RecipeDetail } from '../models/recipe.models';
import { FirebaseAPiService } from './firebase-api.service';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookmarkRecipeService
  extends FirebaseAPiService
  implements IRecipeService
{
  getRecipes(params: any) {
    const recipesCollection = this.getCollectionRef(['Recipes']);
    const docsQuery = query(
      recipesCollection,
      where(documentId(), 'in', params.queryData.recipeIds)
    );
    return this.getDocs<RecipeDetail>(docsQuery);
  }

  deleteRecipe(recipeId: string) {
    return of();
  }
}
