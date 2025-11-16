import express from "express";
import dotenv from "dotenv";
import { toNodeHandler , fromNodeHeaders} from "better-auth/node";
import cors from "cors";
import {auth} from "./lib/auth.js"


dotenv.config()

const app = express()

// *----------- CORS --------------*
app.use(
    cors({
        origin:"http://localhost:3000",
        methods:["GET","POST","PUT","DELETE"],
        credentials:true,
    })
);

app.all("/api/auth/*splat", toNodeHandler(auth))


app.use(express.json());

app.get("/api/me", async(req,res) =>{
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
    return res.json(session);
})


app.get("/device", async(req,res)=>{
    const {user_code} = req.query
    res.redirect(`http://localhost:3000/device?user_code=${user_code}`)
})


app.get('/health',(req,res)=>{
    res.send("Backend is running")
})

app.listen(process.env.PORT,()=>{
    console.log(`running on PORT : http://localhost:${process.env.PORT}`)
})
