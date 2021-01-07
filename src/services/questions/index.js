const express = require("express");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const { readcontent, writecontent } = require("../../lib/fsutilities");
const {join}=require("path");

const Router = express.Router();
const questionPath = join(__dirname,"questions.json")
Router.post("/giveIDs", async (req, res) => {
  try {
    const questionDB = await readcontent(questionPath);
    questionDB.forEach((question) => (question._id = uniqid()));
    await writecontent(questionPath,questionDB);
  } catch (error) {
    console.log(error);
  }
});

Router.delete("/:questionID", async (req, res) => {
  try {
    //GETTING DATABASE OF QUESTIONS
    const questionDB = await readcontent(questionPath);
    //CREATE NEW DB WITHOUT SPECIFIED QUESTIONS
    const newDB = questionDB.filter(
      (question) => question._id !== req.params.questionID
    );
    //OVERWRITE OLD DB WITH NEW DB
    await writecontent(questionPath,newDB);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

Router.post(
  "/",
  [
    check("duration")
      .exists()
      .isInt()
      .withMessage("Give a duration for the question"),
    check("text")
      .exists()
      .isLength({ min: 3 })
      .withMessage("Give the actual question"),
    check("answers")
      .exists()
      .isArray({ min: 4, max: 4 })
      .withMessage("Provide at least four answers"),
    check("answers.*.isCorrect")
      .exists()
      .isBoolean()
      .withMessage("You must show if answers are true or false with a boolean"),
    check("answers.*.text").exists().withMessage("Give text of answer"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      res.send(errors);
    } else {
      try {
        const questionDB = await readcontent(questionPath);
        questionDB.push({
          ...req.body,
          _id: uniqid(),
        });
        await writecontent(questionPath,questionDB);
        res.send("Added Question!");
      } catch (error) {
        console.log(error);
        res.send(error);
      }
    }
  }
);

module.exports = Router;