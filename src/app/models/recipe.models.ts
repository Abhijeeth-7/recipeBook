export class RecipeDetail {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  timeInMinutes: number;
  likes: number;
  isBookmarked: boolean;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  authorId: string;

  constructor(args: any) {
    this.id = args.id;
    this.title = args.title || '';
    this.imageUrl = args.imageUrl || '';
    this.timeInMinutes = args.timeInMinutes || 0;
    this.likes = args.likes || 0;
    this.isBookmarked = args.isBookmarked || false;
    this.description = args.description || '';
    this.servings = args.servings || 1;
    this.ingredients =
      args.ingredients?.map(
        (ing: RecipeIngredient) => new RecipeIngredient(ing)
      ) || {};
    this.steps =
      args.steps?.map((step: RecipeStep) => new RecipeStep(step)) || {};
    this.authorId = args.authorId;
  }
}

export class RecipeIngredient {
  quantity: string;
  name: string;
  quantityValue: number;
  private _isChecked = false;

  constructor(args: any) {
    //seperate units from quantity using regex
    this.quantity = args.quantity;
    this.name = args.name;
    this.quantityValue = +(this.quantity.match(/[0-9]/g)?.join('') || 0);
  }

  get isChecked() {
    return this._isChecked;
  }

  set isChecked(value) {
    this._isChecked = value;
  }
}

export class RecipeStep {
  seqNumber: number;
  description: string;

  constructor(args: any) {
    this.seqNumber = args.seqNumber;
    this.description = args.description;
  }
}
