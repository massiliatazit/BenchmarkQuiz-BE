const express = require ("express")
const {readcontent,writecontent} = require("../../lib/fsutilities")
const {join}= require("path")
const uniqid= require("uniqid")
const examsPath = join(__dirname,"exams.json")
const questionPath = join(__dirname,"../questions/questions.json")
const Router = express.Router();
Router.post("/start", async (req, res) => {
    try {
        let questioncounter = 0;
        let score = 0;
        let examDuration =0;
      //GET EXAM AND QUESTION DB
      const examsDB = await readcontent(examsPath);
      const questionsDB = await readcontent(questionPath);
      //CREATE VARIABLE FOR EXAM QUESTIONS
      const actualQuestions = [];
      //GET RANDOM QUESTION INDEXES
      try {
        const selectedQuestions = [];
        for (let i = 0; i < 5; i++) {
          questioncounter++
          let questionIndex = Math.floor(Math.random() * questionsDB.length);
          if (selectedQuestions.includes(questionIndex)) {
            i--;
          } else {
            selectedQuestions.push(questionIndex);
          }
        }
        //GET QUESTIONS FROM RANDOM INDEXES ABOVE
        selectedQuestions.forEach((index) => {
          actualQuestions.push(questionsDB[index]);
  
          examDuration += questionsDB[index].duration;
        })
      } catch (error) {
        console.log(error);
      }
      //PUSH EXAM OBJECT TO DATABASE
      examsDB.push({
        ...req.body,
        _id: uniqid(),
        examDate: new Date(),
        isCompleted: false,
        totalDuration: examDuration,
        questions: actualQuestions,
      });
      //OVERWRITE OLD DB WITH NEW DB
      await writecontent(examsPath,examsDB);
      res.send("Added!");
    } catch (error) {
      console.log(error);
    }
  });
  Router.get("/:examID", async (req, res) => {
    try {
      //GETTING SELECTED EXAM
      const examsDB = await readcontent(examsPath);
      const selectedExam = examsDB.find((exam) => exam._id === req.params.examID);
      //CALCULATE CURRENT SCORE
      let score = 0;
      selectedExam.questions.forEach((question) => {
         (question.answers[question.providedAnswer].isCorrect? score += 1: score) 
          
        
      });
      selectedExam.score = score;
      selectedExam.isCompleted = true;
      res.send(selectedExam);
    } catch (error) {
      console.log(error);
    }
  });
  
  Router.post("/:examID/answer", async (req, res) => {
    try {
      //GET EXAM DATABASE
      const examsDB = await readcontent(examsPath);
      //GETTING OUR EXAM FROM THE REQ.PARAMS
      const selectedExamIndex = examsDB.findIndex(
        (exam) => exam._id === req.params.examID
      );
      //IF/ELSE
      if (selectedExamIndex !== -1) {
        examsDB[selectedExamIndex].questions[req.body.question].providedAnswer =
          req.body.answer;
        await writecontent(examsPath,examsDB);
        res.send( "🌺 Got your answer! 🌺");
      } else {
        res.send("Couldn't find this exam 🥺");
      }
    } catch (error) {
      console.log(error);
    }
  });
  
module.exports = Router