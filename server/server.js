import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js'
import userRouter from './routes/userRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import creditRouter from './routes/creditRoutes.js'
// import auth from './middlewares/auth.js'
import { stripeWebhooks } from './controllers/webhooks.js'


const app = express()


await connectDB()

//middleware
app.set('trust proxy', 1)

// Logging middleware FIRST
app.use((req,res,next)=>{
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
})

// Stripe webhook BEFORE json parser (needs raw body)
app.post('/api/stripe', express.raw({type:'application/json'}), stripeWebhooks)

// Test webhook endpoint
app.get('/api/stripe', (req, res) => {
  res.json({
    status: 'Webhook endpoint is ready',
    method: 'POST /api/stripe',
    body_type: 'raw JSON',
    timestamp: new Date().toISOString()
  })
})

// CORS and JSON parser AFTER webhook
app.use(cors())

app.use(express.json())


//routes

app.get('/',(req,res)=>res.send('server is live!'))

app.use('/api/user',userRouter)
app.use('/api/chat',chatRouter)
app.use('/api/message',messageRouter)
app.use('/api/credit',creditRouter)


const PORT = process.env.PORT || 3000


app.listen(PORT, () => {
  console.log(`Server is running at: http://localhost:${PORT}`);
});

// export default app