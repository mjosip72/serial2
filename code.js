
// #region data

let DATA_SUFIX = "";

let input_data_control = document.getElementById("input_data_control");
let output_data_control = document.getElementById("output_data_control");

function on_btn_clear1() {
    output_data_control.value = "";
}

function on_btn_clear2() {
    input_data_control.value = "";
}

function on_btn_send_data() {
    send_data();
}

function on_data(value) {
    input_data_control.value += value;
    input_data_control.scrollTop = input_data_control.scrollHeight;
}

// #endregion

// #region serial connection

let connect_control = document.getElementById("connect_control");
let baudrate_select = document.getElementById("baudrate_select");
let status_label = document.getElementById("status_label");

let port;
let connected;

let textDecoder;
let readableStreamClosed;
let reader;

let textEncoder;
let writableStreamClosed;
let writer;

async function open_port() {

    port = await navigator.serial.requestPort();

    let baudRate = parseInt(baudrate_select.value);
    await port.open({baudRate});

    set_port_status(true);

    textDecoder = new TextDecoderStream();
    readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();
    
    textEncoder = new TextEncoderStream();
    writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    writer = textEncoder.writable.getWriter();

    try {
    while(true) {
        let {value, done} = await reader.read();
        if(done) {
            reader.releaseLock();
            break;
        }
        on_data(value);
    }
    
    }catch(error) {
        close_port();
    }

}

async function close_port() {

    reader.cancel();
    await readableStreamClosed.catch(error => {});
    
    writer.close();
    await writableStreamClosed;

    await port.close();

    set_port_status(false);

}

connect_control.addEventListener("click", e => {
    if(connected) close_port();
    else open_port();
});

async function send_data() {
    await writer.write(output_data_control.value + DATA_SUFIX);
}

function set_port_status(open) {
    connect_control.innerHTML = open ? "Close" : "Open";
    status_label.innerHTML = open ? "Open" : "Closed";
    connected = open;
}

set_port_status(false);

// #endregion
