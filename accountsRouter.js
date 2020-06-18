const express = require("express");
const db = require("./data/dbConfig");

const router = express.Router()

router.get("/", async (req, res, next) => {
    try{
        const accounts = await db.select("*").from("accounts")
        res.status(200).json(accounts)

    } catch (err) {
        next(err)
    }
});

router.get("/:id", async (req, res, next) => {
    try{
        // SELECT commands by default will return an array even if it only contains one value
        // Added .limit(1) to limit the array to one value. Since we are sure that only on value
        // is going to be returned then we add [account] to destructuring the array and in our 
        // res.json(accounts) we are returning the only value
        const [account] = await db.select("*").from("accounts").where("id", req.params.id).limit(1);
        res.status(200).json(account)

    } catch (err) {
        next(err)
    }
});

router.post("/", async (req, res, next) => {
    if(!req.body.name || !req.body.budget) {
        res.status(404).json({ message: "Please include name and budget in your request body." })
    }

    try{
        const payload = {
            name: req.body.name,
            budget: req.body.budget
        }

        const [newAccountId] = await db.insert(payload).into("accounts")
        // Added .first so that is would return only an object without the array
        // This is a shortcut to .limit(1) and destructuring the result 
        const getNewAccount = await db.first("*").from("accounts").where("id", newAccountId)

        res.status(201).json(getNewAccount)

    } catch (err) {
        next(err)
    }   
});

router.put("/:id", async (req, res, next) => {
    if(!req.body.name || !req.body.budget) {
        res.status(400).json({ message: "Please include name and budget in your request body." })
    }

    try{
        const payload = {
            name: req.body.name,
            budget: req.body.budget
        }

        // We can pass in the table name like we did below in
        // db("accounts")
        await db("accounts").update(payload).where("id", req.params.id)
        // This is a shortcut to .limit(1) and destructuring the result 
        const updateAccount = await db.first("*").from("accounts").where("id", req.params.id)

        res.status(200).json(updateAccount)

    } catch (err) {
        next(err)
    }   
});

router.delete("/:id", async (req, res, next) => {
    try{
        await db("accounts").where("id", req.params.id).del()
        // since we do not have anything to reutrn just send 204 No Content
        // which means "success, but no response data is being sent"
        res.status(204).end()
    } catch (err) {
        next(err)
    }   
});

module.exports = router;
