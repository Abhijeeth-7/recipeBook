import { Injectable } from '@angular/core';
import {
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from '@angular/fire/firestore';
import { Observable, map, mergeMap, of, tap } from 'rxjs';
import { IRecipeService } from './IRecipe-service.service';
import { RecipeDetail } from '../models/recipe.models';
import { FirebaseAPiService } from './firebase-api.service';
import { PaginationQuery } from '../models/pagination-query.model';

@Injectable({
  providedIn: 'root',
})
export class RecipeService
  extends FirebaseAPiService
  implements IRecipeService
{
  lastDocRef: any;

  getRecipes(params: PaginationQuery): Observable<RecipeDetail[]> {
    let searchCall, docIds;
    searchCall = of(['']);
    if (params.searchTerm.length || params.timeFilterValue) {
      const recipeSearchStrings = this.getCollectionGroupRef(['SearchStrings']);
      const condtions = [];
      if (params.searchTerm.length) {
        condtions.push(
          where(
            'substrings',
            'array-contains',
            params.searchTerm.toLocaleLowerCase()
          )
        );
      }
      if (params.timeFilterValue) {
        condtions.push(
          where('timeFilterValues', 'array-contains', params.timeFilterValue)
        );
      }
      const serachQuery = query(recipeSearchStrings, ...condtions);
      searchCall = this.getParentDocumentIds(serachQuery);
    }

    const recipies = this.getCollectionRef(['Recipes']);
    const queryConditions: any = [orderBy('likes', params.sort as any)];

    if (params.pageSize) {
      params.pageNumber > 1 &&
        queryConditions.push(startAfter(this.lastDocRef));
      queryConditions.push(limit(params.pageSize));
    }

    this.lastDocRef = params.pageNumber == 1 ? null : this.lastDocRef;

    return searchCall.pipe(
      mergeMap((ids) => {
        docIds = ids.length ? ids : ['-'];
        (params.searchTerm || params.timeFilterValue) &&
          queryConditions.push(where('recipeId', 'in', docIds));
        const paginationQuery = query(recipies, ...queryConditions);
        return this.getDocsUsingPagination<RecipeDetail>(paginationQuery).pipe(
          map((result: any) => {
            this.lastDocRef = result.lastDocRef;
            return result.data;
          })
        );
      })
    );
  }

  deleteRecipe(recipeId: string, recipeImgUrl: string) {
    // change it 'return of()'
    this.deleteFile(recipeImgUrl);
    return this.deleteDoc(['Recipes', recipeId]);
  }
}
