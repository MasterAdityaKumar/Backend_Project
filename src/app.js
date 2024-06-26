import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit: "16kb"})) //form bhara tab jo data liya , wo data json format me hota hai
app.use(express.urlencoded({
    exptended:true,
    limit:"16kb"

}))

app.use(express.static("public"))
app.use(cookieParser())


//routes import

import userRouter from './routes/user.routes.js'

//routes declaration
app.use('/api/v1/users',userRouter)

export {app}