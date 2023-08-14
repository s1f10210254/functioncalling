import { test } from "node:test";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { escape } from "querystring";
import * as dotenv from 'dotenv'
import { extractEmotionalText, emotionalKeywords, text } from "./emotinal";
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
  content:emotinalSentences + "の文章の内容でツイートして",
    // "a,nの引数をもちa**nの計算を行う関数をツイートして"
    
};



const getRecommend_book = (title: string, description:string) =>{
    return title && description ? "本" : "パラメータが足りません";
}

const getStrongestSportsCountry = (sport: string) => {
  switch (sport) {
    case "サッカー":
      return "アルゼンチン";
    case "レスリング":
      return "日本";
    case "卓球":
      return "中国";
    default:
      return "アメリカ";
  }
};

const getPython = (content: string) =>{
  if(content){
    return `${content}`;
  }else{
    return "コンテンツがありません";
  }
}

const lufy_zinkaku = (content : string) =>{
  if(content){
    return `${content}`;
  }else{
    return "コンテンツがありません";
  }
}

const getTwitter = (content: string)=>{
  if (content.includes("の文章の内容でツイートして")){
    return `${content}`;
  }else{
    return "コンテンツがありません";
  }
}

const ToSummarize =(content: string)=>{
  if(content){
    return `${content}`
  }else{
    return "コンテンツがありません";
  }
}


const runLuffyTwitter = (args: { name: string}) =>{
  const luffyContent = lufy_zinkaku("ツイッターでつぶやいて");
  const tweetContent = getTwitter(luffyContent);
//   const run = runplaywrightTweet(tweetContent)
  return tweetContent;
}

const functions = {
  lufy_zinkaku,
  getRecommend_book,
  getStrongestSportsCountry,
  getTwitter,
  getPython,  
  runLuffyTwitter,
  ToSummarize
} as const;




const func = async () => {
  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [prompt],
    function_call: "auto",
    functions: [
    //   {
    //     name: "runplaywrightTweet",
    //     description:"ツイートを送信する",
    //     parameters:{
    //         type: "object",
    //         properties:{
    //             content:{
    //                 type:"string",
    //                 description: "ツイートする内容",
    //             },
    //         },
    //         required:["content"],
    //     }
    //   },
      {
        name:"lufy_zinkaku",
        description: "ワンピースのルフィに成り代わって発言して",
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
      {
        name: "getStrongestSportsCountry",
        description: "スポーツの強い国を取得",
        parameters:{
          type: "object",
          properties:{
            name:{
              type:"string",
              description: "sport",
            },
          },
          required : ["name"],
        },
      },
      {
        name:"getTwitter",
        description:"の文章の内容でツイートしてと書かれた以前の文字を１０文字程度にまとめます",
        parameters :{
          type : "object",
          properties:{
            name :{
              type :"string",
              description: "の文章の内容でツイートしてと書かれた以前の文字を１０文字程度にまとめます",
            },
          },
          required : ["name"],
        },
      },
      {
        name:"getRecommend_book",
        description:"おすすめの本を1冊紹介する",
        parameters :{
          type : "object",
          properties:{
            title :{
              type :"string",
              description: "本のタイトル",
            },
            description:{
              type: "string",
              description: "本の内容",
            },
          },
          required : ["title", "description"],
        },
      },
      {
        name : "getPython",
        description:"pythonのコードぬ部分だけを入手 e.g. def{print(hello)}",
        parameters:{
          type: "object",
          properties:{
            name :{
              type: "string",
              description: "コードの部分を入手",
            },
          },
          require :["name"],
        },
      },
      {
        name : "runLuffyTwitter",
        description:"ルフィの人格でツイッターでつぶやく",
        parameters:{
          type: "object",
          properties:{
            name :{
              type: "string",
              description: "ルフィの人格でツイッターでつぶやく",
            },
          },
          require: ["name"],
        },
      },
      
    ],
  });

 
  //ツイッターでツイートする関数
  const runplaywrightTweet = async (content:string) =>{
    // 新規ブラウザ起動
    const browser = await playwright.chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://twitter.com/login');
    // ログイン情報
    await page.getByLabel('電話番号/メールアドレス/ユーザー名').fill('ini5thji');
    await page.getByLabel('電話番号/メールアドレス/ユーザー名').press('Enter');
    await page.getByLabel('パスワード', { exact: true }).fill('iniad5thjissyuu');
    await page.getByLabel('パスワード', { exact: true }).press('Enter');

    // ツイート内容入力
    const tweetTextbox = await page.getByRole('textbox', { name: 'Tweet text' });
    await tweetTextbox.click();
    await tweetTextbox.fill(content);
    
    //文章にハッシュタグが含まれるとツイートできないため＃がある場合エスケープキーをおす
    if(content.includes("#")){
        await tweetTextbox.press('Escape') 
    }
    // ツイート
    await page.getByTestId('tweetButtonInline').click();
    await page.waitForTimeout(10000);
    await browser.close();
}



  

  const message = res.data.choices[0].message;
  console.log("message", message);
  
  const functionCall = message?.function_call;
  if(!functionCall){
    console.log("functioncallingはよびだされませんでした");
  }
  if (functionCall) {
    const args = JSON.parse(functionCall.arguments || "{}");

    // @ts-ignore
    const funcRes = functions[functionCall.name!](args.name);

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
    });
    console.log("answer", res2.data.choices[0]);
    const responseMessage = res.data.choices[0].message;


    //getRecommend_bookが使われた場合に内容をツイートする
    if(responseMessage?.function_call?.name === 'getRecommend_book' && prompt.content?.includes("ツイートして")){
        const argumentsJson = JSON.parse(responseMessage.function_call.arguments || "{}");
        const tweetContent = `おすすめの本: ${argumentsJson.title}\n${argumentsJson.description}`;
        await runplaywrightTweet(tweetContent);
    }
    else if (responseMessage?.function_call?.name  && prompt.content?.includes("ツイートして")){
        const argumentsJson = JSON.parse(responseMessage.function_call.arguments || "{}");
        const tweetContent = `${argumentsJson.name}`;
        await runplaywrightTweet(tweetContent)
    }
    
  };
};

func();

// const runLuffyTwitter = async () =>{
//   const luffyContent = lufy_zinkaku("ツイッターでつぶやいて");
//   const tweetContent = getTwitter(luffyContent);

//   const res = await openai.createChatCompletion({
//     model: "gpt-3.5-turbo",
//     messages: [
//       prompt,
//       {
//         role: "system",
//         content: luffyContent,
//       },
//       {
//         role: "user",
//         content: tweetContent,
//       },
//     ],
//   });

//   const message = res.data.choices[0].message;
//   console.log("Luffy's tweet:", message?.content);
// }
// runLuffyTwitter()

