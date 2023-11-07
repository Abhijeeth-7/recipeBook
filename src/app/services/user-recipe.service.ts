import { Injectable, Query } from '@angular/core';
import { orderBy, query, where } from '@angular/fire/firestore';
import { RecipeDetail } from '../models/recipe.models';
import { IRecipeService } from './IRecipe-service.service';
import { FirebaseAPiService } from './firebase-api.service';
import { PaginationQuery } from '../models/pagination-query.model';
import { Observable, map, mergeMap, of, tap } from 'rxjs';
import {
  collection,
  doc,
  documentId,
  limit,
  startAfter,
} from 'firebase/firestore';
import { Bookmark } from '../models/bookmark.model';

@Injectable({
  providedIn: 'root',
})
export class UserRecipeService
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
        this.deletSearchStrings(recipeId);
        this.deleteLikesOnRecipe(recipeId);
        this.removeFromBookmarks(recipeId);
      })
    );
  }

  private deletSearchStrings(recipeId: string) {
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
  }

  private deleteLikesOnRecipe(recipeId: string) {
    const likesCollectionRef = this.getCollectionRef(['Likes']);
    const deleteQuery = query(
      likesCollectionRef,
      where('recipeId', '==', recipeId)
    );
    this.deleteDocsByQuery(deleteQuery);
  }

  private removeFromBookmarks(recipeId: string) {
    const likesCollectionRef = this.getCollectionRef(['Bookmarks']);
    this.getDocs<Bookmark>(query(likesCollectionRef)).subscribe((bookmarks) => {
      bookmarks.forEach((bookmark) => {
        if (bookmark.collections.some((c) => c.recipeIds.includes(recipeId))) {
          bookmark.collections.forEach(
            (col) =>
              (col.recipeIds = col.recipeIds.filter((id) => id !== recipeId))
          );
          this.updateDoc(
            this.getDocRef(['Bookmarks', `${bookmark.bookmarkId!}`]),
            bookmark
          ).subscribe();
        }
      });
    });
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
