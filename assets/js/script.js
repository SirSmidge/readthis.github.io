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

$('#nameGo').on('click', function() {
    // ! #nameGo is a button
    let bcName = $('#nameInput')
        .val()
        .trim();
    // ! #nameInput is a text input
    $('#nameInput').val('');
    $('.navbar-brand').text(bcName);
    // ! updating .navbar-brand isn't necessary
    // ! I put it there for visual feedback that firebase was working
    let newBCKey = database.ref('/bookclubs').push({
        name: bcName
    }).key;
    // ! this returns the firebase key for the newly pushed bookclub
    activeBC = database.ref(`/bookclubs/${newBCKey}`);
    // ! this creates a variable to the active (new) book club reference on firebase
    // TODO need to toggle the bcName and bc-area switcher when user inputs a new bookclub
});

//! populate dropdown menu with existing bookclubs from db
database.ref('/bookclubs').on('child_added', function(snap) {
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

// ! when bookclub from dropdown is clicked...
$(document).on('click', '.dropdown-item', function() {
    let name = $(this).text();
    let key = $(this).attr('data-key');
    // ! grab bc's key I stored in a data- attribute

    $('.navbar-brand').text(`Club: ${name} | Key: ${key}`);
    // ! we don't need to update .navbar-brand, this was just to test
    // ! but we can have a message somewhere that displays their info, etc.

    //! this is is the ui/screen toggle switcher thing
    $('#bcName').toggle(400);
    $('.bc-area').toggle(400);

    // ! update the activeBC reference to the clicked bookclub's key.
    activeBC = database.ref(`/bookclubs/${key}`);
});

// ! Full Calendar stuff

// ! when #showCalendar is clicked, dynamically render calendar
$('#showCalendar').on('click', function() {
    // ! empty the div to prevent multiple calendars
    $('#calendar').html('');

    // ! the below is fullCalendar.io functions/syntax
    var calendarEl = document.getElementById('calendar');

    var recalledEvent = {};

    // ! looks for existing events on firebase
    activeBC.on('value', function(snap) {
        let data = snap.val();
        !(typeof data.event == 'undefined')
            ? (recalledEvent = data.event)
            : (recalledEvent = {});
        // ! above: basically, if event exists: assign it to recalledEvent, else: return an empty object
    });

    // ! the below is the part that creates the calendar.
    var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['interaction', 'dayGrid'],
        defaultView: 'dayGridMonth',
        header: {
            left: 'title',
            center: 'addEventButton',
            right: 'dayGridMonth'
        },
        customButtons: {
            addEventButton: {
                text: 'add event...',
                click: function() {
                    var dateStr = prompt('Enter a date in YYYY-MM-DD format');
                    var date = new Date(dateStr + 'T18:00:00'); // will be in local time

                    if (!isNaN(date.valueOf())) {
                        // valid?
                        // create event object
                        let eventObj = {
                            title: `Book Club Meeting!`,
                            start: date,
                            allDay: false
                        };
                        // add event to calendar
                        calendar.addEvent(eventObj);

                        // push event to firebase
                        activeBC.update({
                            event: eventObj
                        });
                    } else {
                        alert('Invalid date.');
                    }
                }
            }
        },
        events: [recalledEvent]
    });
    // ! line below: unction that makes it all work
    calendar.render();

    // ! my little hack to make it work in our modal
    setTimeout(function() {
        console.log(`I'm in the Timeout!`);
        calendar.changeView('dayGridMonth');
    }, 500);
});

// * OPEN LIBRARY SEARCH

// ! these are my variables for the book search engine
let searchTitle = '',
    olSearch = `http://openlibrary.org/search.json?q=${searchTitle}`,
    cover = '',
    title = '',
    author = '',
    first_sentence = '';

// ! the commented shit below is my openlib object cheat sheet
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

// ! grabbing shit from the search input for our ajax call
$('#searchGo').on('click', function(event) {
    event.preventDefault();
    searchTitle = $('#searchBar')
        .val()
        .trim();
    $('#searchBar').val('');

    // ! form the query
    olSearch = `http://openlibrary.org/search.json?q=${searchTitle}`;

    $.ajax({
        url: olSearch,
        method: 'GET'
    }).then(function(data) {
        olData = JSON.parse(data);
        book = olData.docs[0];

        // ! create book object and push to firebase
        // ! lots of type validation because if we return undefined, everything breaks and we all die
        !(typeof book.isbn == 'undefined')
            ? (cover = `http://covers.openlibrary.org/b/isbn/${
                  book.isbn[0]
              }-L.jpg`)
            : (cover = `https://islandpress.org/sites/default/files/400px%20x%20600px-r01BookNotPictured.jpg`);
        // ! the above link is a default 'book not pictured' image. i'm hotlinking it right now
        // ! we should save it and add it to our image assets.
        !(typeof book.title == 'undefined')
            ? (title = book.title)
            : (title = 'Not Found');
        !(typeof book.author_name == 'undefined')
            ? (author = book.author_name[0])
            : (author = 'Not Found');
        !(typeof book.first_sentence == 'undefined')
            ? (first_sentence = book.first_sentence)
            : (first_sentence = 'Not Found');
        !(typeof book.title == 'undefined')
            ? (title = book.title)
            : (title = 'Not Found');

        // ! create the book object
        let bookObj = {
            title: title,
            author: author,
            cover: cover,
            first_sentence: first_sentence
        };

        // ! push it to firebase
        activeBC.update({
            book: bookObj
        });

        // ! show on DOM, but this will be changed to better fit our UI and display more information.
        let bookDiv = $('<div>');
        let coverimg = $('<img>').attr('src', cover);
        let titleText = $('<h1>').text(title);
        bookDiv.append(titleText, coverimg);
        $('#results').html(bookDiv);
    });
});

// * NYT BEST SELLERS
let nytKey = '2cLMsa04TtSGMPHaBnBBRjtXNhjTHcFp';
let nytQuery = `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${nytKey}`;

$.ajax({
    url: nytQuery,
    method: 'GET'
}).then(function(data) {
    // ! nyt object cheatsheat
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

    // ! loop that prints top 10 into carousel
    for (var i = 0; i < 10; i++) {
        let bookDiv = $('<div>').addClass('carousel-item');
        if (i == 0) bookDiv.addClass('active');
        let cover = $('<img>')
            .addClass('d-block w-100')
            .attr('src', data.results.books[i].book_image);
        let caption = $('<div>').addClass('carousel-caption');
        let title = $('<h5>').text(data.results.books[i].title);
        let author = $('<p>').text(data.results.books[0].author);
        caption.append(title, author);
        bookDiv.append(cover, caption);
        let indicator = $('<li>').attr('data-target', '#nytCarousel');
        indicator.attr('data-slide-to', i);
        if (i == 0) indicator.addClass('active');
        $('.carousel-indicators').append(indicator);
        $('.carousel-inner').append(bookDiv);
    }
});
