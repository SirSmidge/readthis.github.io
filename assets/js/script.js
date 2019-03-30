// ! Initialize Firebase
var config = {
    apiKey: 'AIzaSyCqb0IslXJ9cwRQJpdvlL49Nb5LRsOO6TM',
    authDomain: 'bookclubapp-1da56.firebaseapp.com',
    databaseURL: 'https://bookclubapp-1da56.firebaseio.com',
    projectId: 'bookclubapp-1da56',
    storageBucket: 'bookclubapp-1da56.appspot.com',
    messagingSenderId: '422544061449'
};
firebase.initializeApp(config);
let database = firebase.database(),
    activeBC = '';

// * Grab Book club name
$('#nameGo').on('click', function (e) {
    e.preventDefault();
    let bcName = $('#nameInput')
        .val()
        .trim();
    $('#nameInput').val('');
    $('.navbar-brand').text(bcName);
    let newBCKey = database.ref('/bookclubs').push({
        name: bcName
    }).key;
    activeBC = database.ref(`/bookclubs/${newBCKey}`);
    $('#videobg').toggle(400);
    $('.bc-area').toggle(400);
});

database.ref('/bookclubs').on('child_added', function (snap) {
    let data = snap.val();
    let key = snap.key;
    let name = data.name;
    let newAnchor = $('<a>')
        .addClass('dropdown-item')
        .text(name)
        .attr({
            'data-key': key,
            src: '#'
        });
    $('.dropdown-menu').append(newAnchor);
});



$(document).on('click', '.dropdown-item', function () {
    console.log('dropdown item clicked');
    let name = $(this).text();
    let key = $(this).attr('data-key');
    $('.navbar-brand').text(`Club: ${name} | Key: ${key}`);

    $('#videobg').toggle(400);
    $('#mainContent').toggle(400);

    $("#bc-name").text(name);
    activeBC = database.ref(`/bookclubs/${key}`);
    activeBC.on("value", function (snap) {
        let data = snap.val();

        let book = {};
        if (!(typeof data.book === 'undefined')) {
            book = data.book;
            $("#bc-book").text(`Book: ${book.title} by ${book.author}`);
        } else {
            $("#bc-book").text(`You haven't chosen a book yet!`);
        }

    });

});

// ! Full Calendar

$('#showCalendar').on('click', function () {
    $('#calendar').html('');
    var calendarEl = document.getElementById('calendar');

    var recalledEvents = [];

    activeBC.on('value', function (snap) {
        let data = snap.val();
        !(typeof data.events == 'undefined') ?
        (recalledEvents = data.events) :
        (recalledEvents = []);
        console.log(recalledEvents);
    });

    var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['interaction', 'dayGrid'],
        defaultView: 'dayGridMonth',
        header: {
            left: 'title',
            center: 'addEventButton',
            right: 'dayGridMonth'
        },
        events: recalledEvents
    });
    calendar.render();
    setTimeout(function () {
        console.log(`I'm in the Timeout!`);
        calendar.changeView('dayGridMonth');
    }, 500);
});

$(document).on("click", '#pushMeeting', function () {
    let events = [];
    activeBC.on("value", function (snap) {
        let data = snap.val();
        !(typeof data.events === "undefined") ?
        events = data.events: events = []
    });
    let date = $("#eventDate").val();
    let time = $("#eventTime").val();
    let event = new Date(date + `T${time}:00`);
    let eventObj = {
        title: `Book Club Meeting!`,
        start: event,
        allDay: false
    }
    events.push(eventObj);


    // push event to firebase
    activeBC.update({
        events: events
    });
});

/* 

Add Meeting function notes:

time value = 24H:MM.
push to FullCalendar like `T${time.val()}:00`


*/

// * OPEN LIBRARY SEARCH

let searchTitle = '';
let olSearch = `http://openlibrary.org/search.json?q=${searchTitle}`;

let cover = '',
    title = '',
    author = '',
    first_sentence = '';

/* 
$.ajax({
    url: olSearch,
    method: 'GET'
}).then(function(data) {
    olData = JSON.parse(data);
    isbn = book.isbn[0];
    olCover = `http://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

    console.log(`Open Library Data`);
    console.log(olData);
    console.log('~~~~~~~~~');
    console.log('Results array');
    console.log(olData.docs);
    console.log('~~~~~~~~~');
    console.log('0th-index author name // array, get 1st.');
    console.log(book.author_name[0]);
    console.log('~~~~~~~~~');
    console.log('0th-index book title');
    console.log(book.title);
    console.log('~~~~~~~~~');
    console.log('0th-index isbn // array, get 1st');
    console.log(book.isbn[0]);
    console.log('~~~~~~~~~');
    console.log('0th-index first sentence // array, get 1st');
    console.log(book.first_sentence[0]);
    console.log('~~~~~~~~~');
    console.log(olCover);
});
*/

$('#searchGo').on('click', function (event) {
    event.preventDefault();
    searchTitle = $('#searchBar')
        .val()
        .trim();
    $('#searchBar').val('');
    olSearch = `http://openlibrary.org/search.json?q=${searchTitle}`;

    $.ajax({
        url: olSearch,
        method: 'GET'
    }).then(function (data) {
        olData = JSON.parse(data);
        book = olData.docs[0];

        // create book object and push to firebase
        !(typeof book.isbn == 'undefined') ?
        (cover = `http://covers.openlibrary.org/b/isbn/${
                  book.isbn[0]
              }-L.jpg`) :
        (cover = `https://islandpress.org/sites/default/files/400px%20x%20600px-r01BookNotPictured.jpg`);
        !(typeof book.title == 'undefined') ?
        (title = book.title) :
        (title = 'Not Found');
        !(typeof book.author_name == 'undefined') ?
        (author = book.author_name[0]) :
        (author = 'Not Found');
        !(typeof book.first_sentence == 'undefined') ?
        (first_sentence = book.first_sentence) :
        (first_sentence = 'Not Found');
        !(typeof book.title == 'undefined') ?
        (title = book.title) :
        (title = 'Not Found');

        let bookObj = {
            title: title,
            author: author,
            cover: cover,
            first_sentence: first_sentence
        };
        activeBC.update({
            book: bookObj
        });

        // show on DOM
        let bookDiv = $('<div>');
        let coverimg = $('<img>').attr('src', cover);
        let titleText = $('<h1>').text(title);
        bookDiv.append(titleText, coverimg);
        $('#results').html(bookDiv);
    });
});

// * Create Book Card Function
function createBSCard(image, title, author) {
    // main card
    var card = $("<div>");
    card.attr("class", "card");
    card.attr("data-name", title);
    // Card Image
    var cardImage = $("<img>")
    cardImage.attr("class", "card-image");
    cardImage.attr("src", image);
    cardImage.attr("data-title", title);
    cardImage.attr("data-author", author);
    // Building the card
    card.append(cardImage);
    //Append to your div here
    $("#trending-books").append(card);
}

// * NYT BEST SELLERS
let nytKey = '2cLMsa04TtSGMPHaBnBBRjtXNhjTHcFp';
let nytQuery = `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${nytKey}`;

$.ajax({
    url: nytQuery,
    method: 'GET'
}).then(function (data) {
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
    for (var i = 0; i < 5; i++) {
        createBSCard(data.results.books[i].book_image, data.results.books[i].title, data.results.books[0].author)
    }
});

/*
 */