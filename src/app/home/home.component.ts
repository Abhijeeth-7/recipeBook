import { Component } from '@angular/core';
import { IRecipeService } from '../services/IRecipe-service.service';
import { RecipeService } from '../services/recipeService';
import { FirebaseAPiService } from '../services/firebase-api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    {
      provide: IRecipeService,
      useClass: RecipeService,
    },
  ],
})
export class HomeComponent {}
