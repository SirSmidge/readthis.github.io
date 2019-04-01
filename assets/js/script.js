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

// ! Full Calendar

const calendarFunc = () => {
    console.log('calendar function ran')
    var recalledEvents = [];

    activeBC.on('value', function (snap) {
        let data = snap.val();
        !(typeof data.events == 'undefined') ?
        (recalledEvents = data.events) :
        (recalledEvents = []);
    });
    $('#calendar').html('');
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['list'],
        height: 'parent',
        timeZone: 'UTC',
        defaultView: 'listMonth',
        header: {
            left: '',
            center: 'title',
            right: 'prev,next'
        },
        events: recalledEvents
    });
    calendar.render();
    setTimeout(function () {
        calendar.changeView('listMonth');
    }, 500);
}

$(document).on("click", '#pushMeeting', function () {
    let events = [];
    activeBC.on("value", function (snap) {
        let data = snap.val();
        !(typeof data.events === "undefined") ?
        events = data.events: events = []
    });
    let date = $("#eventDate").val();
    let time = $("#eventTime").val();
    let event = new Date(date + `T${time}:00Z`);
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
    setTimeout(function () {
        calendarFunc();
    }, 500);
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

// * Grab Book club name
$('#nameGo').on('click', function (e) {
    e.preventDefault();
    let name = $('#nameInput')
        .val()
        .trim();
    $('#nameInput').val('');

    // ! set activeBC
    let key = database.ref('/bookclubs').push({
        name: name
    }).key;
    activeBC = database.ref(`/bookclubs/${key}`);

    // ! switch view
    $('#videoBg').toggle(400);
    $('#mainContent').toggle(400);

    // ! update bookclub info on page
    $('#bcName').text(`Welcome, ${name}`);
    activeBC.on("value", function (snap) {
        let data = snap.val();

        let book = {};
        if (!(typeof data.book === 'undefined')) {
            book = data.book;
            $("#bcBookCover").attr("src", `${book.cover}`)
            $("#bcBookTitle").text(`Book: ${book.title}`);
            $("#bcBookAuthor").text(`by ${book.author}`)
        } else {
            $("#bcBook").text(`You haven t chosen a book yet! Search for one below.`);
        }

    });

    calendarFunc();
});

$(document).on('click', '.dropdown-item', function () {
    let name = $(this).text();
    let key = $(this).attr('data-key');

    // ! switch view
    $('#videoBg').toggle(400);
    $('#mainContent').toggle(400);

    $('#bcName').text(`Welcome back, ${name}`);
    activeBC = database.ref(`/bookclubs/${key}`);
    activeBC.on("value", function (snap) {
        let data = snap.val();

        let book = {};
        if (!(typeof data.book === 'undefined')) {
            book = data.book;
            $("#bcBookCover").attr("src", `${book.cover}`)
            $("#bcBookTitle").text(`${book.title}`);
            $("#bcBookAuthor").text(`by ${book.author}`)
        } else {
            $("#bookArea").html(`You haven't chosen a book yet! Search for one below.`);
        }

    });
    calendarFunc();
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


$('#searchGo').on('click', function () {
    let keyword = $("#bookSearch").val();
    let olQuery = `https://openlibrary.org/search.json?q=${keyword}`;
    $.ajax({
        url: olQuery,
        method: 'GET'
    }).done(function (data) {
        olData = JSON.parse(data);
        $("#results").html('');
        $.each(olData.docs, function (i, item) {
            console.log(item);

            // checks if cover exists
            (typeof item.isbn != 'undefined') ?
            (cover = `http://covers.openlibrary.org/b/isbn/${
                  item.isbn[0]
              }-L.jpg`) :
            (cover = `https://islandpress.org/sites/default/files/400px%20x%20600px-r01BookNotPictured.jpg`);

            // checks cover is not an empty pixel
            let resTest = new Image();
            resTest.src = cover;
            if (resTest.naturalWidth < 100) cover = `https://islandpress.org/sites/default/files/400px%20x%20600px-r01BookNotPictured.jpg`;

            if (i < 5) {
                createBSCard(cover, item.title, item.author_name, "#results")
            }
            $('[data-toggle="tooltip"]').tooltip();
        });
    })

    // // create book object and push to firebase
    // !(typeof book.isbn == 'undefined') ?
    // (cover = `http://covers.openlibrary.org/b/isbn/${
    //           book.isbn[0]
    //       }-L.jpg`) :
    // (cover = `https://islandpress.org/sites/default/files/400px%20x%20600px-r01BookNotPictured.jpg`);
    // !(typeof book.title == 'undefined') ?
    // (title = book.title) :
    // (title = 'Not Found');
    // !(typeof book.author_name == 'undefined') ?
    // (author = book.author_name[0]) :
    // (author = 'Not Found');
    // !(typeof book.first_sentence == 'undefined') ?
    // (first_sentence = book.first_sentence) :
    // (first_sentence = 'Not Found');
    // !(typeof book.title == 'undefined') ?
    // (title = book.title) :
    // (title = 'Not Found');

    // let bookObj = {
    //     title: title,
    //     author: author,
    //     cover: cover,
    //     first_sentence: first_sentence
    // };
    // activeBC.update({
    //     book: bookObj
    // });
    // console.log("you've updated your book!")

    // // show on DOM
    // let bookDiv = $('<div>');
    // let coverimg = $('<img>').attr('src', cover);
    // let titleText = $('<h1>').text(title);
    // bookDiv.append(titleText, coverimg);
    // $('#results').html(bookDiv);
});

// * Create Book Card Function
function createBSCard(image, title, author, area) {
    // main card
    var card = $("<div>");
    card.attr("class", "card")
    card.attr("class", "trending")
    card.attr("data-name", title)
    card.attr("data-toggle", "tooltip")
    card.attr("data-html", "true")
    card.attr("title", `<em>${title}</em> by ${author}`)
    // Card Anchor
    var cardAnchor = $("<a>");
    cardAnchor.attr("href", "#currentbook");
    // Card Image
    var cardImage = $("<img>")
    cardImage.attr("class", "card-image");
    cardImage.attr("src", image);
    cardImage.attr("data-title", title);
    cardImage.attr("data-author", author);
    // Building the card
    cardAnchor.append(cardImage);
    card.append(cardAnchor);
    //Append to your div here
    $(area).append(card);
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
        createBSCard(data.results.books[i].book_image, data.results.books[i].title, data.results.books[i].author, "#trendingBooks")
    }
    $('[data-toggle="tooltip"]').tooltip();
});


$(document).on("click", ".card-image", function () {
    let author = $(this).attr("data-author"),
        cover = $(this).attr("src"),
        title = $(this).attr("data-title");

    let bookObj = {
        title: title,
        author: author,
        cover: cover,
    };
    activeBC.update({
        book: bookObj
    });
    console.log("you've updated your book!")
})