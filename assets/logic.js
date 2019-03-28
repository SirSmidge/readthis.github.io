let nytKey = '2cLMsa04TtSGMPHaBnBBRjtXNhjTHcFp';
let nytQuery = `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${nytKey}`;

$.ajax({
    url: nytQuery,
    method: 'GET'
}).then(function(data) {
    console.log('NYT Bestsellers Data');
    console.log(data);
    console.log('~~~~~~~~~');
    console.log('Array of Best Sellers');
    console.log(data.results.books);
    console.log('~~~~~~~~~');
    console.log('0-index Author');
    console.log(data.results.books[0].author);
    console.log('~~~~~~~~~');
    console.log('0-index Title');
    console.log(data.results.books[0].title);
    console.log('0-index Description');
    console.log(data.results.books[0].description);
    console.log('~~~~~~~~~');
    console.log('0-index Cover image');
    console.log(data.results.books[0].book_image);
    console.log('~~~~~~~~~');
    console.log('0-index Amazon link');
    console.log(data.results.books[0].amazon_product_url);
    console.log('~~~~~~~~~');
    console.log('0-index Indie link');
    console.log(data.results.books[0].buy_links[0].url);
});

// OPEN LIBRARY TEST

let searchTitle = 'Harry Potter';
let olSearch = `http://openlibrary.org/search.json?q=${searchTitle}`;

let isbn, olCover;

$.ajax({
    url: olSearch,
    method: 'GET'
}).then(function(data) {
    olData = JSON.parse(data);
    isbn = olData.docs[0].isbn[0];
    olCover = `http://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

    console.log(`Open Library Data`);
    console.log(olData);
    console.log('~~~~~~~~~');
    console.log('Results array');
    console.log(olData.docs);
    console.log('~~~~~~~~~');
    console.log('0th-index author name // array, get 1st.');
    console.log(olData.docs[0].author_name[0]);
    console.log('~~~~~~~~~');
    console.log('0th-index book title');
    console.log(olData.docs[0].title);
    console.log('~~~~~~~~~');
    console.log('0th-index isbn // array, get 1st');
    console.log(olData.docs[0].isbn[0]);
    console.log('~~~~~~~~~');
    console.log('0th-index first sentence // array, get 1st');
    console.log(olData.docs[0].first_sentence[0]);
    console.log('~~~~~~~~~');
    console.log(olCover);
});