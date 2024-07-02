import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectToDatabase from './database/conn.js';
import router from './router/route.js';
const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by');//less hackers know about our stack

const port = 8000;

app.get('/', (req, res) => {
    res.status(201).json("home get request");
})

// Api routes..
app.use('/api', router);

// mongoose.connect("mongodb://127.0.0.1:27017/theChat",{
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(()=>{
//     console.log('db connected...')
// }).catch((err)=>{
//     console.log('db not connected....')
// })

// app.listen(port, ()=>{
//     console.log(`server connected to http://localhost:${port}`)
// })

// start server only when we have a valid connection.....

connectToDatabase().then(()=>{
    try{
        app.listen(port,()=>{
            console.log(`Server connected to http://localhost:${port}`);
        })
    }catch(error){
        console.log('cannot connect to the server')
    }
}).catch(error=>{
    console.log('invalid database connection....');
})