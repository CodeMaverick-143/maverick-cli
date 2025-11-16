import express from "express";
import dotenv from "dotenv";

dotenv.config()

const app = express()

app.use(express.json());

app.get('/health',(req,res)=>{
    res.send("Backend is running")
    console.log("Backend is running")
})

app.listen(process.env.PORT,()=>{
    console.log(`running on PORT : http://localhost:${process.env.PORT}`)
})
