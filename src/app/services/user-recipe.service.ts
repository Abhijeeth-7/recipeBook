import { Injectable } from '@angular/core';
import { orderBy, query, where } from '@angular/fire/firestore';
import { RecipeDetail } from '../models/recipe.models';
import { IRecipeService } from './IRecipe-service.service';
import { FirebaseAPiService } from './firebase-api.service';
import { PaginationQuery } from '../models/pagination-query.model';
import { tap } from 'rxjs';
import { collection, doc, documentId } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserRecipeService
  extends FirebaseAPiService
  implements IRecipeService
{
  getRecipes(params: PaginationQuery) {
    const recipies = this.getCollectionRef(['Recipes']);

    const queryConditions: any = [
      orderBy('title'),
      where('authorId', '==', params.queryData.authorId),
      where('title', '>=', params.searchTerm.toLowerCase()),
      where('title', '<=', params.searchTerm.toLowerCase() + '\uf8ff'),
      orderBy('likes'),
    ];

    // if (pageSize) {
    //   queryConditions.push(limit(pageSize));
    // }

    const recipiesQuery = query(recipies, ...queryConditions);
    return this.getDocs<RecipeDetail>(recipiesQuery);
  }

  createRecipie(newRecipe: RecipeDetail) {
    const recipeId = this.getDocIdByCollectionRef(['Recipes']);
    return this.setDoc(
      ['Recipes', recipeId],
      Object.assign({ recipeId }, JSON.parse(JSON.stringify(newRecipe)))
    ).pipe(
      tap((docRef) => {
        this.setSubstringsDoc(recipeId, newRecipe.title);
        this.setTimeFiltervaluesDoc(recipeId, newRecipe.timeInMinutes);
      })
    );
  }

  updateRecipie(recipeId: string, updatedRecipe: RecipeDetail) {
    const recipeRef = this.getDocRef(['Recipes', recipeId]);
    return this.updateDoc(
      recipeRef,
      JSON.parse(JSON.stringify({ recipeId, ...updatedRecipe }))
    ).pipe(
      tap((_) => {
        this.setSubstringsDoc(recipeId, updatedRecipe.title);
        this.setTimeFiltervaluesDoc(recipeId, updatedRecipe.timeInMinutes);
      })
    );
  }

  deleteRecipe(recipeId: string, recipeImgUrl: string) {
    this.deleteFile(recipeImgUrl);
    return this.deleteDoc(['Recipes', recipeId]).pipe(
      tap((_) => {
        this.deleteDoc([
          'Recipes',
          recipeId,
          'SearchStrings',
          recipeId + 'substrings',
        ]);
        this.deleteDoc([
          'Recipes',
          recipeId,
          'SearchStrings',
          recipeId + 'timeFilterValues',
        ]);
      })
    );
  }

  private setSubstringsDoc(recipeId: string, title: string) {
    const substringDocRef = [
      'Recipes',
      recipeId,
      'SearchStrings',
      recipeId + 'substrings',
    ];
    this.setDoc(substringDocRef, {
      substrings: this.generateSubstrings(title.toLocaleLowerCase()),
    });
  }

  private setTimeFiltervaluesDoc(recipeId: string, timeInMinutes: number) {
    const timeFilterDocRef = [
      'Recipes',
      recipeId,
      'SearchStrings',
      recipeId + 'timeFilterValues',
    ];
    this.setDoc(timeFilterDocRef, {
      timeFilterValues: this.constructTimeFilterArray(timeInMinutes),
    });
  }

  private generateSubstrings(inputString: string): string[] {
    const substrings: string[] = [];

    for (let start = 0; start < inputString.length; start++) {
      for (let end = start + 1; end <= inputString.length; end++) {
        const substring = inputString.substring(start, end);
        substrings.push(substring);
      }
    }

    return substrings;
  }

  private constructTimeFilterArray(timeInMinutes: number) {
    const filterValues = [];
    if (timeInMinutes > 180) {
      filterValues.push('>180');
    }
    for (let min = 180; min > 0 && timeInMinutes <= min; min -= 30) {
      filterValues.push('<=' + min);
    }
    return filterValues;
  }
}
