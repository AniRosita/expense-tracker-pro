const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Rosi@2006",
    database: "expense_tracker"
});

db.connect((err) => {

    if(err){
        console.log("Database Connection Failed ❌");
        console.log(err);
    }else{
        console.log("MySQL Connected ✅");
    }

});

app.get("/", (req,res) => {

    res.sendFile(path.join(__dirname,"index.html"));

});

app.post("/register",(req,res)=>{

    const {name,email,password} = req.body;

    const checkSql =
    "SELECT * FROM users WHERE email=?";

    db.query(checkSql,[email],(err,result)=>{

        if(err){

            return res.status(500).json({
                success:false,
                message:"Database Error"
            });

        }

        if(result.length > 0){

            return res.json({
                success:false,
                message:"You already have an account. Please login."
            });

        }

        const insertSql =
        "INSERT INTO users(name,email,password) VALUES(?,?,?)";

        db.query(insertSql,[name,email,password],(err)=>{

            if(err){

                return res.status(500).json({
                    success:false,
                    message:"Registration Failed"
                });

            }

            return res.json({
                success:true,
                message:"Registration Successful"
            });

        });

    });

});

app.post("/login",(req,res)=>{

    const {email,password} = req.body;

    const sql =
    "SELECT * FROM users WHERE email=? AND password=?";

    db.query(sql,[email,password],(err,result)=>{

        if(err){

            return res.status(500).json({
                success:false,
                message:"Database Error"
            });

        }

        if(result.length > 0){

            return res.json({
                success:true,
                message:"Login Successful",
                user:result[0]
            });

        }

        return res.json({
            success:false,
            message:"Invalid Email or Password"
        });

    });

});

const PORT = 5000;

app.listen(PORT,()=>{

    console.log(`Server running on port ${PORT}`);

});