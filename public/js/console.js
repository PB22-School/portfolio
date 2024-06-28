
let font;

function preload() {
    font = loadFont('public/fonts/roboto.ttf');
}

function setup() {
    createCanvas(innerWidth, innerHeight-100);
    background(0);
    textFont(font);
    textWrap(CHAR);
    textSize(22);
}

let pwd = "/home/users/parker/projects ~ % ";

let text_before = "/home/users/parker/projects ~ % ";
let text_wrap_length = innerWidth - 150;
let ySep = 22;
let lineN = 0;
let maxLines = 20;

let counter = 0;
let blink_time = 0.5;
let blink_on = true;

let first = true;

let current_command = '';

function draw() {
    // if (current_command === "Meta") {
    //     current_command = "";
    // }

    background(0);
    strokeWeight(1);
    stroke(100);
    noFill();
    rect(50,50,innerWidth - 100, innerHeight - 150);

    stroke('green');
    fill('green');

    text(text_before,60,77, innerWidth - 150);

    let text_w_add = (textWidth(text_before) % text_wrap_length);
    let text_h_add = floor((textWidth(text_before) / text_wrap_length) + lineN) * ySep;

    // text_w_add *= min(text_h_add,1);

    //strokeWeight(2);
    //line(text_w_add + 60,text_h_add + 60,text_w_add + 70,text_h_add + 70);
    //line(text_w_add + 60,text_h_add + 80,text_w_add + 70,text_h_add + 70);

    if (counter >= blink_time) {
        counter = 0;
        blink_on = !blink_on;
    }

    counter += deltaTime / 1000;

    // maybe just add the textWidth, not the modulus'd thing

    if (current_command) {
        text(current_command,text_w_add + 60,text_h_add + 77, innerWidth - 150);
    }

    text_width = (textWidth(current_command) + text_w_add) % text_wrap_length;
    text_h_add = (floor((textWidth(current_command) + text_w_add) / text_wrap_length) + lineN) * ySep;

    if (blink_on) {
        line(text_width + 65,text_h_add + 80,text_width + 80,text_h_add + 80);
    }
}

function windowResized() {
    resizeCanvas(innerWidth, innerHeight-100);
    text_wrap_length = innerWidth - 150;
    background(0);
}

function execute() {

    lineN += 2;
    text_before += current_command;

    current_command = current_command.toLowerCase();
    if (current_command === '?' || current_command === 'help') {
        text_before += ""
    }
    else if(current_command === 'clear') {
        text_before = '';
    }
    else {
        
    }
    // execute the code

    current_command = '';
    text_before += pwd;
}

function keyPressed() {
    // if you hold a key it acts like it was pressed multiple times based on time intervals
}

function keyReleased() {
    if (key === "Enter") {
        execute();
    }
    else if (key === "Backspace") {
        current_command = current_command.substring(0,current_command.length - 1);
    }
    else if(key.length > 1) {
        return;
    }
    else {
        current_command += key;
    }
}