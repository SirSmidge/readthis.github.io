let nytKey = '2cLMsa04TtSGMPHaBnBBRjtXNhjTHcFp';
let nytQuery = `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${nytKey}`;

$.ajax({
    url: nytQuery,
    method: 'GET'
}).then(function(data) {
    /*
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
    console.log('~~~~~~~~~~');
    console.log('0-index Indie link');
    console.log(data.results.books[0].buy_links[0].url);
    */

    // loop that prints top 10
    for (var i = 0; i < 10; i++) {
        let bookDiv = $('<div>');
        let cover = $('<img>').attr('src', data.results.books[i].book_image);
        let title = $('<h1>').text(data.results.books[i].title);
        bookDiv.append(title, cover);
        $('#covers').append(bookDiv);
    }
});

// OPEN LIBRARY TEST

let searchTitle = ''; // get ;
let olSearch = `http://openlibrary.org/search.json?q=${searchTitle}`;

let isbn, olCover;

/* 
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
*/

$('#searchGo').on('click', function(event) {
    event.preventDefault();
    searchTitle = $('#searchBar')
        .val()
        .trim();
    $('#searchBar').val('');
    olSearch = `http://openlibrary.org/search.json?q=${searchTitle}`;

    $.ajax({
        url: olSearch,
        method: 'GET'
    }).then(function(data) {
        olData = JSON.parse(data);
        console.log(`This is the data for ${searchTitle}`);
        console.log(olData);
        if (!(typeof olData.docs[0].isbn == 'undefined')) {
            isbn = olData.docs[0].isbn[0];
            olCover = `http://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
        } else {
            olCover = `https://islandpress.org/sites/default/files/400px%20x%20600px-r01BookNotPictured.jpg`;
        }
        let bookDiv = $('<div>');
        let cover = $('<img>').attr('src', olCover);
        let title = $('<h1>').text(olData.docs[0].title);
        bookDiv.append(title, cover);
        $('#results').prepend(bookDiv);
    });
});

// Full Calendar

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: [dayGridPlugin],
        defaultView: 'dayGridMonth'
    });

    calendar.render();
});
