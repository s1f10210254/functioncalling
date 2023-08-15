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
// const emotinalSentences = extractEmotionalText(text, emotionalKeywords);




const prompt: ChatCompletionRequestMessage = {
  role: "user",
  // content:emotinalSentences + "の文章の内容でツイートして",
  content:text,
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
    if (content) {
      const maxLength = 50; // 最大文字数を設定（例えば100文字とします）
      const summary = content.length > maxLength
        ? `${content.substring(0, maxLength)}...`
        : content;
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



const functions = {
  
  lufy_zinkaku,
  getTwitter,
  ToSummarize
} as const;

const functionDefinition = [
    {
        name: "ToSummarize",
        description:"与えられた文章を１０文字程度にする関数",
        parameters:{
          type: "object",
          properties:{
            name:{
              type:"string",
              description:"要約する文章の内容を入力してください。 ",
            },
          },
          require:["name"],
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

  const message = res.data.choices[0].message;
  console.log("message", message);
  
  //2回目のfunctioncalling
  const functionCall = message?.function_call;
  if(!functionCall){
    console.log("2回目のfunctioncallingはよびだされませんでした");
  }
  
  if (functionCall) {
    const args =JSON.parse(functionCall.arguments || "{}");

    // console.log("func.name",functionCall.name)
    // @ts-ignore
    const funcRes = functions[functionCall.name](args.name);

    //functioncallingが読み出された時の処理
    const res2 = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        prompt,
        message,
        {
          role: "function",
          content: funcRes,
          name: functionCall.name,
        },
      ],
      functions:functionDefinition
    });
    console.log(res2.data.choices[0]);
    const responseMessage = res2.data.choices[0].message;
    console.log("２回目", responseMessage);


    //3回目のfunctioncalling
    const functionCall2 = responseMessage?.function_call;


    if (responseMessage) {
        const functioncontent = responseMessage.content;
        console.log("3回目のfunctioncallingはなしで代わりにGPTがきた!");
      
        
        // const summarizedText = functions.ToSummarize(functioncontent);
      
        // 要約をツイートっぽく整形して作成
        const tweetContent = `${functioncontent}`;
        console.log(tweetContent)
        await runplaywrightTweet(tweetContent)
        }
      
    if(!functionCall2){
        console.log("3回目のfunctioncallingはよびだされませんでした");
        
    }
    if (functionCall2) {
        const args2 =JSON.parse(functionCall2.arguments || "{}");
    
        // @ts-ignore
        const funcRes3 = functions[functionCall2.name](args2.name);
    
        //functioncallingが読み出された時の処理
        const res3 = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            prompt,
            responseMessage,
            {
              role: "function",
              content: funcRes3,
              name: functionCall2.name,
            },
          ],
          functions:functionDefinition
        // [
        //     {
        //           name:"lufy_zinkaku",
        //           description: "文章の内容をワンピースのルフィに成り代わって発言して",
        //           parameters :{
        //             type : "object",
        //             properties:{
        //               name :{
        //                 type :"string",
        //                 description: "ワンピースのルフィに成り代わって発言して",
        //               },
        //             },
        //             required : ["name"],
        //           },
        //         },
        //   ]
        });
        const responseMessage2 = res3.data.choices[0].message;
        console.log("３回目", responseMessage2);

        if (responseMessage2?.function_call?.name === "lufy_zinkaku" ){
            
            const argumentsJson = JSON.parse(responseMessage2.function_call.arguments || "{}");
            const tweetContent = `${argumentsJson.name}`;
            await runplaywrightTweet(tweetContent)
        }
    }
  };
} catch (error){
  console.error("Error", (error as any).message);
}
};


func();

