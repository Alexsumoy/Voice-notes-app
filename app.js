//Testing the browser-support of the aplication and showing message on error
try {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
} catch (e) {
    console.error(e);
    $('.no-browser-support').show();
    $('.app').hide();
}

//Creating variables
var noteTextarea = $('#note-textarea');
var instructions = $('#recording-instructions');
var notesList = $('ul#notes');

var noteContent = '';

//Displaying previous notes
var notes = getAllNotes();
renderNotes(notes);


// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// useful recording even when the user pauses.
recognition.continuous = true;

// This block is called every time the Speech APi captures a line.
recognition.onresult = function(event) {

    // Selecting only the current capture.
    var current = event.resultIndex;

    // Get a transcript of what was said.
    var transcript = event.results[current][0].transcript;

    // Add the current transcript to the contents of our Note.
    var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

    if (!mobileRepeatBug) {
        noteContent += transcript;
        noteTextarea.val(noteContent);
    }
};

//writing instructions on screen

recognition.onstart = function() {
    instructions.text('Recording your voice-note. Speak into the microphone.');
    $('#note-textarea').css({
        'background-color': '#fff',
        'color': 'black'

    });

}


recognition.onspeechend = function() {
    instructions.text('You were quiet for a while so voice recognition turned itself off.');
    $('#note-textarea').css({
        'background-color': '#aaaaaa25',
        'color': 'red'
    })
}

recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
        instructions.text('No speech was detected. Try again.');
    };
}



//Buttons

$('#start-record-btn').on('click', function(e) {
    if (noteContent.length) {
        noteContent += ' ';


    }
    recognition.start();

});


$('#pause-record-btn').on('click', function(e) {
    recognition.stop();
    instructions.text('Voice recognition paused.');
});

//Write the text inside the text area in the noteContent variable.
noteTextarea.on('input', function() {
    noteContent = $(this).val();
})

$('#save-note-btn').on('click', function(e) {
    recognition.stop();

    if (!noteContent.length) {
        instructions.text('Could not save empty note. Please add a message to your note.');
    } else {
        // Save note to localStorage.
        saveNote(new Date().toLocaleString(), noteContent);

        // Reset variables and update UI.
        noteContent = '';
        renderNotes(getAllNotes());
        noteTextarea.val('');
        instructions.text('Note saved successfully.');
    }

})


notesList.on('click', function(e) {
    e.preventDefault();
    var target = $(e.target);

    // Listen to the selected note.
    if (target.hasClass('listen-note')) {
        var content = target.closest('.note').find('.content').text();
        readOutLoud(content);
    }

    // Delete note.
    if (target.hasClass('delete-note')) {
        var dateTime = target.siblings('.date').text();
        deleteNote(dateTime);
        target.closest('.note').remove();
    }
});



//Speech function

function readOutLoud(message) {
    var speech = new SpeechSynthesisUtterance();

    // Set the text source and voice attributes.
    speech.text = message;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;


    window.speechSynthesis.speak(speech);
}



//Creating notes on save and erasing on delete

function renderNotes(notes) {
    var html = '';
    if (notes.length) {
        notes.forEach(function(note) {
            html += `<li class="note" style="float:left">
        <div class="header">
          <h2 class="date">${note.date}</h2>
          <a href="#" class="listen-note" title="Listen to Note">Listen</a>
          <a href="#" class="delete-note" title="Delete">Delete</a>
        </div>
        <textarea class="content" style="overflow:initial">${note.content}</textarea>
      </li>`;
        });
    } else {
        html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
    }
    notesList.html(html);
}


function saveNote(dateTime, content) {
    localStorage.setItem('note-' + dateTime, content);
}


function getAllNotes() {
    var notes = [];
    var key;
    for (var i = 0; i < localStorage.length; i++) {
        key = localStorage.key(i);

        if (key.substring(0, 5) == 'note-') {
            notes.push({
                date: key.replace('note-', ''),
                content: localStorage.getItem(localStorage.key(i))
            });
        }
    }
    return notes;
}


function deleteNote(dateTime) {
    localStorage.removeItem('note-' + dateTime);
}