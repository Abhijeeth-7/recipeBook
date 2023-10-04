export class PaginationQuery {
  searchTerm: string;
  pageNumber: number;
  pageSize: number;
  sort: string;
  timeFilterValue: string | null;
  queryData: any;

  constructor(args: any) {
    this.searchTerm = args.searchTerm || '';
    this.pageNumber = args.pageNumber || 0;
    this.pageSize = args.pageSize || 10;
    this.sort = args.sort || 'asc';
    this.timeFilterValue = args.timeFilterValue || null;
    this.queryData = args.queryData;
  }
}
