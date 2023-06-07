import { feathers } from "@feathersjs/feathers";
import { koa, rest, bodyParser, errorHandler, serveStatic } from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'

interface Message {
    id?: number;
    text: string;
}

class MessageService {
    messages: Message[] = [];

    async find() {
        return this.messages;
    }

    async create(data: Pick<Message, "text">) {
        const message: Message = {
            id: this.messages.length,
            text: data.text
        }
        this.messages.push(message);
        return message;
    }
}

type ServiceTypes = {
    messages: MessageService;
}

const app = koa<ServiceTypes>(feathers())

// Use the current folder for static file hosting
app.use(serveStatic('.'))
// Register the error handle
app.use(errorHandler())
// Parse JSON request bodies
app.use(bodyParser())

// Register REST service handler
app.configure(rest())
// Configure Socket.io real-time APIs
app.configure(socketio())

// Register our messages service
app.use("messages", new MessageService());


// Add any new real-time connection to the `everybody` channel
app.on('connection', (connection) => app.channel('everybody').join(connection))
// Publish all events to the `everybody` channel
app.publish((_data) => app.channel('everybody'))

// Start the server
app.listen(3030).then(() => console.log('Feathers server listening on localhost:3030'))


app.service("messages").on("created", (message: Message) => {
    console.log("Created a message", message);
});

// const main = async () => {
//     // Create a new message on our message service
//     await app.service('messages').create({
//         text: 'Hello Feathers'
//     })

//     // And another one
//     await app.service('messages').create({
//         text: 'Hello again'
//     })

//     // Find all existing messages
//     const messages = await app.service('messages').find()

//     console.log('All messages', messages)
// }

// main()




