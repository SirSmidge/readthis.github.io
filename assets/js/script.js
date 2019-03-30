$(function() {
console.log('script started!');

let nytKey = '2cLMsa04TtSGMPHaBnBBRjtXNhjTHcFp';
let nytQuery = `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${nytKey}`;

const bookProcessor = function(book_list) {
        
    const bookAnchor = $('.bookData');

    for (let i = 0; i < book_list.length; i++) {
    //text += data[i] + "<br>";
        let book = book_list[i];

        var coverBook = book.book_image;
        var author = book.author;
        var title = book.title;
        var description = book.description;

        // console.log('book title : ', title);
        // console.log('book author : ', author);
        // console.log('book description : ', description);

        let text = '<div class="book">'+
            '<div class="bookTitle">' + title + '</div>' +
            '<div class="bookAuthor">' + author + '</div>' +
            '<div class="bookDescription">' + description + '</div>' +
            '</div>';
        bookAnchor.append(text);

    // console.log('NYT Bestsellers Data');
    //   console.log(data);
    // console.log('~~~~~~~~~');
        //console.log('Array of Best Sellers');
        //console.log(data.results.books);
        //console.log('~~~~~~~~~');
        //console.log('0-index Author');
        // console.log(data.results.books[0].author);
        // console.log('~~~~~~~~~');
        // console.log('0-index Title');
        // console.log(data.results.books[0].title);
        // console.log('0-index Description');
        // console.log(data.results.books[0].description);
        // console.log('~~~~~~~~~');
        // console.log('0-index Cover image');
        // console.log(data.results.books[0].book_image);
        // console.log('~~~~~~~~~');
        // console.log('0-index Amazon link');
        // console.log(data.results.books[0].amazon_product_url);
        // console.log('~~~~~~~~~');
        // console.log('0-index Indie link');
        // console.log(data.results.books[0].buy_links[0].url);
    }
};

let result=[];
$.ajax({
    url: nytQuery,
    method: 'GET'
}).then(function(data) {

    if (data.status != 'OK') {
        throw new Error('unexpected results status: ' + data.status);
    }

    let hardcover_fiction_list = data.results;

    if (hardcover_fiction_list && hardcover_fiction_list.books && hardcover_fiction_list.books.length > 0) {
        bookProcessor(hardcover_fiction_list.books);
        console.log('data.results = ', data.results);
    }
})
.catch(function(error) {
    console.log('Caught error in ajax transaction: ', error);
});

// OPEN LIBRARY TEST

let searchTitle = 'Harry Potter';
let olSearch = `http://openlibrary.org/search.json?q=${searchTitle}`;

let isbn, olCover;

$.ajax({
    url: olSearch,
    method: 'GET'
}).then(function(data) {
    if (data) {
    olData = JSON.parse(data);
    if (olData && olData.docs && olData.docs[0]) {
        
        isbn = olData.docs[0].isbn[0];
        olCover = `http://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

        var i;
        for (i = 0; i <books.length; i++) {
            text += books[i] + "<br>";
        }

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
    }
    }
    else {
        console.log('Error: data undefined');
    }
});

});