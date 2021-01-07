const { writeJson, readJson } = require("fs-extra");


const readDB = async (filePath) => {
  try {
    const FileJson = await readJson(filePath);
    return FileJson;
  } catch (err) {
    console.log(err);
  }
};
 const writeDB = async(filePath,filecontent) =>{

    try{
        const writeonJson = await writeJson(filePath,filecontent)
        return writeonJson


    }catch(err){
        console.log(err)
    }
 }
 module.exports={
     readcontent : async (filePath)=>readDB(filePath),
     writecontent : async (filePath,filecontent)=>writeDB(filePath,filecontent)
 }