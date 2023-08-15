import { test } from "node:test";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { escape } from "querystring";
import * as dotenv from 'dotenv'
import { extractEmotionalText, emotionalKeywords, text } from "./emotinal";
import { error } from "console";
import { runplaywrightTweet, getTrend } from "./usePlaywright";
dotenv.config();
const playwright = require('playwright');
const axios = require('axios');

const apiKey = process.env.API_KEY;

const configuration = new Configuration({
  // apiKey: "APIKEY",
  apiKey
});
const openai = new OpenAIApi(configuration);

// 感情的な文章を抜き取ったもの(emotinal.ts参照)
const emotinalSentences = extractEmotionalText(text, emotionalKeywords);




const prompt: ChatCompletionRequestMessage = {
  role: "user",
  // content:emotinalSentences + "の文章の内容でツイートして",
  content:emotinalSentences,
    // content:"おすすめの本を紹介するツイートして"
    
};






const getTwitter = (content: string)=>{
  if (content){
    return `${content.slice(0,50)}`;
  }else{
    return "コンテンツがありません";
  }
}

const ToSummarize = (content: string) => {
    console.log("ToSummarizeのcontentの中身",content)
    if (content) {
      const cleanContent = JSON.parse(content).text; // エスケープ文字を取り除く
      const summary = cleanContent.substring(0, 10); // 最初の10文字を抽出
      return summary;
    } else {
      return "コンテンツがありません";
    }
  }

const lufy_zinkaku = (content : string) =>{
  if(content){
    return `ルフィ：${content}海賊王に俺はなる！`;
  }else{
    return "コンテンツがありません";
  }
}

const testToSummarize = () => {
    const content = JSON.stringify({ name: "シャワーを浴びて洋服を選ぼう" });
    const result = ToSummarize(content);
    console.log("ToSummarize Result:", result);
  }
  
  testToSummarize();

const functions = {
  
  lufy_zinkaku,
  getTwitter,
  ToSummarize
} as const;

const functionDefinition = [
    
    {
        name: "ToSummarize",
        description: "与えられた文章を10文字程度に要約してください",
        parameters: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "要約する文章の内容を入力してください。",
            },
          },
          required: ["text"],
        },
      },
      {
        name:"getTwitter",
        description:"文章の内容で感情をこめてツイートする投稿内容を教えて。与えられた文章よりも必ず短いツイート文にしてください",
        parameters :{
          type : "object",
          properties:{
            name :{
              type :"string",
              description: "ツイートする文章の内容を教えて",
            },
          },
          required : ["name"],
        },
      },
      {
        name:"lufy_zinkaku",
        description: "文章の内容をワンピースのルフィに成り代わって発言して",
        parameters :{
          type : "object",
          properties:{
            name :{
              type :"string",
              description: "ワンピースのルフィに成り代わって発言して",
            },
          },
          required : ["name"],
        },
      },
      
]

const func = async () => {
  try{
  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [prompt],
    function_call: "auto",
    functions: functionDefinition,
  });

  console.log("ChatCompletion Response:", res.data.choices[0].message);


  const message = res.data.choices[0].message;
  console.log("message", message);
  console.log(message?.function_call?.arguments)
  
  
        if (message?.function_call?.name  ){
            
            const argumentsJson = JSON.parse(message.function_call.arguments || "{}");
            const tweetContent = `${argumentsJson.name}`;
            // const tweetContent = responseMessage.content
            await runplaywrightTweet(tweetContent)
        }
    
  

} catch (error){
  console.error("Error", (error as any).message);
}
;
}

func();

