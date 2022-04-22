## Install & Run

```
npm install
```

```
npm start
```


## Author Queries:

Get author by id:
```
query {
  author(id: 1) {
    id
    name
  }
}
```

Author list:
```
query {
  authors {
    name
  }
}
```

Add Author:
```
query {
  addAuthor(name: "Fatih") {
    name
  }
}
```

Update Author:
```
query {
  updateAuthor(id: 4, name: "Emily Strange") {
    success
  }
}
```

Delete Author:
```
query {
  deleteAuthor(id: 4) {
    success
  }
}
```

### Book Queries

Get book by id:
```
query {
  book(id: 1) {
    id
    title
    year
    author {
      name
    }
  }
}
```
[Run](http://localhost:4000/api?query=query%20%7B%0A%20%20book(id%3A2)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20year%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D)


## Multiple

```
query {
  authors {
    name
  }
  book(id: 1) {
    id
    title
    year
    author {
      name
    }
  }
}
```