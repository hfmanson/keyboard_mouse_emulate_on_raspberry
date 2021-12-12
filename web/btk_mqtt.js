
function setupMqtt() {
    let
        mqtt
        , connected = false
        ;
    const
        host = "localhost"
        , port = 9001
        , path = "/python/mqtt"
        , reconnectTimeout = 2000
        , useTLS = false
        , topic = "bluetooth/keyboard"
        , send = (data) => {
            if (connected) {
                const
                    message = new Paho.MQTT.Message(data)
                    ;

                message.destinationName = topic;
                mqtt.send(message);
            }
        }, onConnect = (ev) => {
            console.log('Connected to ' + host + ':' + port + path);
            connected = true;
        }, onConnectionLost = (responseObject) => {
            setTimeout(MQTTconnect, reconnectTimeout);
            console.log("connection lost: " + responseObject.errorMessage + ", Reconnecting");
        }, options = {
            timeout: 3,
            useSSL: useTLS,
            cleanSession: true,
            onSuccess: onConnect,
            onFailure: (message) => {
                console.log("Connection failed: " + message.errorMessage + "Retrying");
                setTimeout(MQTTconnect, reconnectTimeout);
            }
        }
        ;

	mqtt = new Paho.MQTT.Client(
		host,
		port,
		path,
		"web_" + parseInt(Math.random() * 100, 10)
	);
	mqtt.onConnectionLost = onConnectionLost;
	console.log("Host = " + host + ", port = " + port + ", path = " + path + ", TLS = " + useTLS);
	mqtt.connect(options);
    return send;
}

addEventListener("load", function(ev) {
    const
        send = setupMqtt()
        , report = new Uint8Array([ 0xA1, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ])
        , textToSend = document.getElementById("text")
        , sendButton = document.getElementById("send")
		, lookup = {
			"1": { modifier: 0, scancode: 0x1E },
			"!": { modifier: 2, scancode: 0x1E },
			"2": { modifier: 0, scancode: 0x1F },
			"@": { modifier: 2, scancode: 0x1F },
			"3": { modifier: 0, scancode: 0x20 },
			"#": { modifier: 2, scancode: 0x20 },
			"4": { modifier: 0, scancode: 0x21 },
			"$": { modifier: 2, scancode: 0x21 },
			"5": { modifier: 0, scancode: 0x22 },
			"%": { modifier: 2, scancode: 0x22 },
			"6": { modifier: 0, scancode: 0x23 },
			"^": { modifier: 2, scancode: 0x23 },
			"7": { modifier: 0, scancode: 0x24 },
			"&": { modifier: 2, scancode: 0x24 },
			"8": { modifier: 0, scancode: 0x25 },
			"*": { modifier: 2, scancode: 0x25 },
			"9": { modifier: 0, scancode: 0x26 },
			"(": { modifier: 2, scancode: 0x26 },
			"0": { modifier: 0, scancode: 0x27 },
			")": { modifier: 2, scancode: 0x27 },
			"\x0D": { modifier: 0, scancode: 0x28 }, // RETURN
			"\x1B": { modifier: 0, scancode: 0x29 }, // ESC
			"\x08": { modifier: 0, scancode: 0x2A }, // BACKSPACE
			"\x09": { modifier: 0, scancode: 0x2B }, // TAB
			" ": { modifier: 0, scancode: 0x2C },
			"-": { modifier: 0, scancode: 0x2D },
			"_": { modifier: 2, scancode: 0x2D },
			"=": { modifier: 0, scancode: 0x2E },
			"+": { modifier: 2, scancode: 0x2E },
			"[": { modifier: 0, scancode: 0x2F },
			"{": { modifier: 2, scancode: 0x2F },
			"]": { modifier: 0, scancode: 0x30 },
			"}": { modifier: 2, scancode: 0x30 },
			"\\": { modifier: 0, scancode: 0x31 },
			"|": { modifier: 2, scancode: 0x31 },
//	"`": { modifier: 0, scancode: 0x32 },
//	"~": { modifier: 2, scancode: 0x32 },
			";": { modifier: 0, scancode: 0x33 },
			":": { modifier: 2, scancode: 0x33 },
			"'": { modifier: 0, scancode: 0x34 },
			"\"": { modifier: 2, scancode: 0x34 },
			"`": { modifier: 0, scancode: 0x35 },
			"~": { modifier: 2, scancode: 0x35 },
			",": { modifier: 0, scancode: 0x36 },
			"<": { modifier: 2, scancode: 0x36 },
			".": { modifier: 0, scancode: 0x37 },
			">": { modifier: 2, scancode: 0x37 },
			"/": { modifier: 0, scancode: 0x38 },
			"?": { modifier: 2, scancode: 0x38 },
		}
        , charToScancode = function (character) {
            const
                result = {
                    modifier: 0,
                    scancode: 0
                }
                , upper = character.toUpperCase()
				, charCode = upper.charCodeAt(0)
                ;
            if (upper >= "A" && upper <= "Z") {
                result.modifier = upper === character ? 2 : 0;
                result.scancode = charCode - 61;
            } else {
				const
					val = lookup[character]
					;
				if (val) {
					result.modifier = val.modifier;
					result.scancode = val.scancode;
				}
			}
			return result;
        }
		, sendScanCode = function(x) {
			report[2] = x.modifier;
			report[4] = x.scancode;
			send(report);
			report[4] = 0;
			send(report);
		}
        , sendKeyboard = function () {
            const
                text = textToSend.value
				cr = charToScancode("\r")
                ;
                
            console.log(text);
			for (let i = 0; i < text.length; i++) {
				const
					result = charToScancode(text.charAt(i))
					;

				console.log(result);
				if (result.scancode !== 0) {
					sendScanCode(result);
				}
			}
			sendScanCode(cr);
        }
        ;

    sendButton.addEventListener("click", sendKeyboard, false);
}, false);

