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

    pagination(resultsPerPage: number) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultsPerPage * (currentPage - 1);

        this.query = this.query.limit(resultsPerPage).skip(skip);

        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-createdAt");
        }
        return this;
    }
}

export default APIFilters;