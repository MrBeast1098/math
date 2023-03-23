let express = require('express');
let io;
let app = express();
let socket = require('socket.io');
let server;
let {Configuration, OpenAIApi} = require('openai')
let prevString = ''
const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);

async function getAI(prompt){
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: (`The previous question was + ${prevString} continues question ${prompt}`),
            temperature: 0.9,
            max_tokens: 700,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.6,
            stop: [" Human:", " AI:"],
        });
        prevString = prompt
    io.emit('html', JSON.stringify({type: 'aiRec', data:response.data.choices[0].text.replaceAll('\n', '<br>')}));
}

async function getJS(prompt) {
    const response = await openai.createCompletion({
        model: "code-davinci-002",
        prompt: prompt,
        temperature: 0,
        max_tokens: 60,
        top_p: 1.0,
        frequency_penalty: 0.5,
        presence_penalty: 0.0,
        stop: ["You:"],
    });
    io.emit('html', JSON.stringify({type: 'jsRec', data:response.data.choices[0].text.replaceAll('\n', '<br>')}));
}


function client() {
    server = app.listen(80, function () {
        console.log('Let it begin...')

        app.use(express.static('public')) // to use public folder

        io = socket(server); // same as io = socket.app.listen

        io.on('connection', (socket) => {//start of socket.io

            console.log('Socket Connected!')

            socket.on('js', function (data) {


                let msg = JSON.parse(data);

                switch (msg.type) {
                    case 'ai':
                        getAI(msg.data);
                        break;
                    case 'js':
                        getJS(msg.data)
                        break;
                        default:
                        break;
                }

            });
        })

    });
}
client();




