export class Bookmark {
  bookmarkId?: string;
  userId: string;
  collections: Array<BookmarkCollection>;

  constructor(args: any) {
    this.bookmarkId = args.id;
    this.userId = args.userId;
    this.collections =
      args.collections?.map((c: any) => new BookmarkCollection(c)) || [];
  }
}

export class BookmarkCollection {
  name: string;
  recipeIds: Array<string>;

  constructor(args: any) {
    this.name = args.name;
    this.recipeIds = args.recipeIds || [];
  }

  get recipeCount() {
    return this.recipeIds.length;
  }
}
