var players
var day = 0
var answer
var nth = 1
var answers = []
var gameovermodal
var share_string = ""
var copy = ''
var next_game = 0
var tooltips = []
var region
function clear_suggestions() {
    document.getElementById('suggestions').innerHTML = ""
}


document.addEventListener('mouseup', function(e) {
    var container = document.getElementById('suggestions');
    if (!container.contains(e.target)) {
        container.innerHTML = ''
    }
});

fetch("player_data.json", {headers: {}})
    .then(response => response.json()).then(data => 
        {
            players = data.players;
            answer=players[data.answer];
            day=data.day;
            region=data.region;
            document.title = `Valorantle - ${data.region} #${data.day}`;
            next_game = data.next_game;
        }
    ).then(() => {ready()})


function get_time_until_next_game() {
    let now = new Date().getTime();
    let newdate = new Date(next_game*1000)
    let hours = Math.floor(((newdate-now) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor(((newdate-now) % (1000 * 60 * 60)) / (1000 * 60));
    return [hours, minutes];
}
function add_answer(player_name) {
    tooltips.forEach(element => {
        element.hide()
    });

    if (player_name in answers || nth == 9) {
        return;
    }
    answers.push(player_name);
    overwrite_cookie('answers', answers.join(','));
    clear_suggestions();
    document.getElementById('input').value = ''
    player_data = players[player_name];
    row = document.getElementById(`item-${nth}`);

    /* Player name */
    if (player_data[0] == answer[0]) {
        row.innerHTML += `<td style="word-break: break-all" class="m-1 rounded bg-success">${answer[0]}</td>`
        copy += String.fromCodePoint(129001)
    }
    else {
        row.innerHTML += `<td style="word-break: break-all" class="rounded ">${player_data[0]}</td>`
        copy += String.fromCodePoint(0x2B1B)

    }

    copy += ' ';
    /* Country */
    if (player_data[2] == answer[2]) {
        row.innerHTML += `<td data-bs-toggle="tooltip" data-bs-title="The nationality is correct!" style="vertical-align: middle" class=" correct bg-success rounded "><span class="fi fi-${answer[2].toLowerCase()}"></span></td>` 
        copy += String.fromCodePoint(129001)
    }
    else {
        row.innerHTML += `<td data-bs-toggle="tooltip" data-bs-title="Wrong nationality" style="vertical-align: middle" class="rounded"><span class="fi fi-${player_data[2].toLowerCase()}"></span></td>`;    
        console.log('hhh')
        copy += String.fromCodePoint(0x2B1B)
    }
    /* Team */
    
    if (player_data[4] == answer[4]) {
        row.innerHTML += `<td style="box-sizing: content-box;" data-bs-toggle="tooltip" data-bs-title="The guessed team is correct!" class="rounded bg-success">
            ${player_data[4]}
        </td>` /*Teams are same, flags are same*/
        copy += String.fromCodePoint(129001)
    }
    else {
        if (player_data[5] == answer[5]) {
           row.innerHTML += `<td data-bs-toggle="tooltip" data-bs-title="Team is in the same region, but is not correct (${player_data[5]})." style="box-sizing: content-box;" class="rounded bg-warning">
            ${player_data[4]}
            </td>` /*Teams are different, flags are same*/
            copy += String.fromCodePoint(0x1F7E8)
        }
        else {
            row.innerHTML += `<td data-bs-toggle="tooltip" data-bs-title="The guessed team was incorrect and the team is not in the same region (${player_data[5]})." style="box-sizing: content-box;" class="rounded">
                 ${player_data[4]}
            </td>` /*Teams are different, flags are different*/
            copy += String.fromCodePoint(0x2B1B)
        }
    }
    copy += ' '
    /* Agents */
    to_add = "<td class='rounded'>"
    for (let guess_agent of Array(3).keys()) {
        guessed_agent = player_data[6][guess_agent]
        answer_agent = answer[6][guess_agent]
        if (guessed_agent == answer_agent) { 
            to_add += `<span><img data-bs-toggle="tooltip" data-bs-title="The answer and guessed player share ${guessed_agent} as the #${guess_agent+1} most played agent."  class='border rounded border-5 border-success ms-2' src='/assets/agents/${guessed_agent}_icon.png'><span style="vertical-align: middle"> </span></span>`
            copy += String.fromCodePoint(129001)
        }
        else if (answer[6].indexOf(guessed_agent) > -1) {
            index = answer[6].indexOf(guessed_agent);
            copy += String.fromCodePoint(0x1F7E8)
            if (index > guess_agent) {
                to_add += `<span><img data-bs-toggle="tooltip" data-bs-title="The answer player plays less ${guessed_agent}." class='border rounded border-5 border-warning bg-success ms-2' src='/assets/agents/${guessed_agent}_icon.png'><span style="vertical-align: middle">&#8595;</span></span>`
            }
            else {
                to_add += `<span><img data-bs-toggle="tooltip" data-bs-title="The answer player plays more ${guessed_agent}." class='border rounded border-5 border-warning bg-success ms-2' src='/assets/agents/${guessed_agent}_icon.png'><span style="vertical-align: middle">&#8593;</span></span>`   
            }
        }
        else {
            copy += String.fromCodePoint(0x2B1B)
            to_add += `<span ><img data-bs-toggle="tooltip" data-bs-title="The answer player does not have ${guessed_agent} in top 3 most played agents this season." class='border rounded border-5 border-dark-subtle ms-2' src='/assets/agents/${guessed_agent}_icon.png'><span vertical-align: middle"> </span></span>`        
        }
    }
    row.innerHTML += to_add + '</td>'
    copy += ' '
    /* IGL */
    if (player_data[7] == answer[7]) {
        copy += String.fromCodePoint(129001)
        row.innerHTML +=  
            player_data[7] 
            ?
             `<td data-bs-toggle="tooltip" data-bs-title="The answer player is an IGL." class='rounded bg-success'>Yes</td>` 
            : 
            `<td data-bs-toggle="tooltip" data-bs-title="The answer player is not an IGL." class='rounded bg-success'>No</td> `
    }
    else {
        copy += String.fromCodePoint(0x2B1B)
        row.innerHTML +=
            player_data[7] 
            ?
              `<td data-bs-toggle="tooltip" data-bs-title="The answer player is not an IGL." class='rounded'>Yes</td>`
            : 
              `<td data-bs-toggle="tooltip" data-bs-title="The answer player is IGL." class='rounded'>No</td> `

    }
    document.getElementById('counter').innerHTML = nth + '/8'
    copy += '\n'
    nth += 1;
    tooltips = [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    if (player_data[0] == answer[0] || nth == 9) {
        document.getElementById('input').disabled = true;
        let [hours, minutes] = get_time_until_next_game()
        if (player_data[0] == answer[0]) {
            document.getElementById('winmodaltitle').innerHTML = 'Congratulations!';
            document.getElementById('winmodalbody').innerHTML = `<p>You guessed the mystery player correctly!</p><p>The next game is in ${hours} hours and ${minutes} minutes.</p>`;
        }
        else{
            document.getElementById('winmodaltitle').innerHTML = 'You failed!';
            document.getElementById('winmodalbody').innerHTML = '<p>You failed to guess the mystery player, better luck next time! Today\s player was <span class="fw-bold">' + answer[0] + `</span>.</p><p>The next game is in ${hours} hours and ${minutes} minutes.</p>`;
        }
        console.log('done');
        gameovermodal.show();
        return
    }
}


function copy_answers() {
    navigator.clipboard.writeText(`Valorantle ${region} #${day} ${nth-1}/8\n` +copy + '\n' + `https://valorantle.com/${region.toLowerCase()}`);
    gameovermodal.hide();
}

function get_cookie_by_name(name) {
    let cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        if (cookie.includes(name)) {
            return cookie.split('=')[1];
        }
    }
    return null;
}

function overwrite_cookie(name, value) {
    expires = Math.floor((new Date(next_game * 1000) - new Date()) / 1000) 
    document.cookie = `${name}=${value}; max-age=${expires};`;
    console.log(`max-age=${expires};`)
    document.cookie = `hasSeenTutorial=true; expires=Fri, 31 Dec 9999 23:59:59 GMT;`
    console.log(document.cookie);
} 


function play_again() {
    document.getElementById('input').disabled = false;
    answer = players[Object.keys(players)[Math.floor(Math.random()*Object.keys(players).length)]]
    for (let i = 1; i < 9; i++) {
        console.log('item-'+i);
        document.getElementById('item-'+i).innerHTML = '';
    }
    nth = 1;
}

function ready() {
    const myModalAlternative = new bootstrap.Modal('#exampleModal', {backdrop: 'static', keyboard: false})
    gameovermodal = new bootstrap.Modal('#winmodal', {backdrop: 'static', keyboard: false})
    if (!get_cookie_by_name('hasSeenTutorial')) {
        myModalAlternative.show();
        document.getElementById('exampleModal').addEventListener('hidden.bs.modal', function (event) {
            document.cookie = "hasSeenTutorial=true; expires=Fri, 31 Dec 9999 23:59:59 GMT;";
        })
    }
    var answers = get_cookie_by_name('answers');
    if (answers) {
        for (let as of answers.split(',')) {
            add_answer(as.toLowerCase());
            if (as.toLowerCase() == answer[0].toLowerCase()) {
                break;
            }
        }
        answers = answers.split(',');
    }
    else {
        answers = [];
    }
    input = document.getElementById('input');
    input.addEventListener("keyup", function(event) {
        clear_suggestions();
        if (event.key == "Enter") {
            if (input.value.toLowerCase() in players) {
                add_answer(input.value.toLowerCase())
            }
        }
        else {
            for (let key in players) {
                if (key.startsWith(input.value.toLowerCase()) && input.value) {
                    document.getElementById('suggestions').innerHTML += `<div class='item p-2' onclick=add_answer("${key}")>${players[key][0]}</div>`
                }
            }
        }
    })
}
