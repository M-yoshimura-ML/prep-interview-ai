class APIFilters {
    query: any;
    queryStr: any;
    constructor(query: any, queryStr: any) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        const queryCopy = { ...this.queryStr };
        const removeFields = ["sort", "page", "limit"];
        removeFields.forEach((el) => delete queryCopy[el]);

        this.query = this.query.find(queryCopy);
        return this;
    }
}

export default APIFilters;