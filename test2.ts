import { test } from "node:test";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { escape } from "querystring";
import * as dotenv from 'dotenv'
import { extractEmotionalText, emotionalKeywords, text } from "./emotinal";
import { error } from "console";
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
  // content:emotinalSentences,
    content:"おすすめの本を紹介するツイートして"
    
};



const getRecommend_book = (title: string, description:string) =>{
    return title && description ? "本" : "パラメータが足りません";
}


const getPython = (content: string) =>{
  if(content){
    return `${content}`;
  }else{
    return "コンテンツがありません";
  }
}



// const getTwitter = (content: string)=>{
//   if (content.includes("の文章の内容でツイートして")){
//     return `${content}`;
//   }else{
//     return "コンテンツがありません";
//   }
// }

const ToSummarize =(content: string)=>{
  if(content){
    // return `${content}`
    return "○○で○○だ。"
  }else{
    return "コンテンツがありません";
  }
}




const functions = {
  
  getRecommend_book,
  
  // getTwitter,
  getPython,  
  ToSummarize
} as const;


const func = async () => {
  try{
  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [prompt],
    function_call: "auto",
    functions: [
      // {
      //   name:"getTwitter",
      //   description:"の文章の内容でツイートしてと書かれた以前の文章を１０文字程度にまとめてください",
      //   parameters :{
      //     type : "object",
      //     properties:{
      //       name :{
      //         type :"string",
      //         description: "の文章の内容でツイートしてと書かれた以前の文字を１０文字程度にまとめてください",
      //       },
      //     },
      //     required : ["name"],
      //   },
      // },
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
        name: "ToSummarize",
        description:"文章の内容を伐採して５文字にしてください。 例、○○で○○。 動作で状態。",
        parameters:{
          type: "object",
          properties:{
            name:{
              type:"string",
              description:"文章の内容を伐採して５文字にしてください。 例、○○で○○。 動作で状態",
            },
          },
          require:["name"],
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


const getTrend = async() => {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://twitter.com/login');
  // ログインの処理を追加
  await page.getByLabel('電話番号/メールアドレス/ユーザー名').click();
  await page.getByLabel('電話番号/メールアドレス/ユーザー名').fill('ini5thji');
  await page.getByLabel('電話番号/メールアドレス/ユーザー名').press('Enter');
  await page.getByLabel('パスワード', { exact: true }).fill('iniad5thjissyuu');
  await page.getByLabel('パスワード', { exact: true }).press('Enter');
  
  await page.getByTestId('AppTabBar_Explore_Link').click();
  await page.getByRole('tab', { name: 'Trending' }).click();
  
  // トレンドアイテムのセレクター
  const itemsSelector = 'section > div > div > div';
  await page.waitForSelector(itemsSelector);
  
  // トレンドアイテムを取得
  const items = await page.$$(itemsSelector);
  const trends:string[] = [];
  const length = items.length;


  for (let i = 0; i < length; i++) {
    const item = items[i];
    const textElement = await item.$('div');
    if (textElement) {
      const text = await textElement.innerText();
      
      // 正規表現を使用してトレンド情報を選別
      const hashtagPattern = /#([^ \t\n]+)/g;
      const match = text.match(hashtagPattern);
      if (match) {
        trends.push(...match);
      }
    }
  }
  await browser.close();
  return trends;
}

  

  const message = res.data.choices[0].message;
  console.log("message", message);
  // console.log("sssss",message?.function_call?.arguments)
  
  // console.log(message?.function_call?.arguments)

  const functionCall = message?.function_call;
  if(!functionCall){
    console.log("functioncallingはよびだされませんでした");
  }
  // if (functionCall) {
  //   const args =JSON.parse(functionCall.arguments || "{}");

  //   // @ts-ignore
  //   const funcRes = functions[functionCall.name](args.name);

  //   //functioncallingが読み出された時の処理
  //   const res2 = await openai.createChatCompletion({
  //     model: "gpt-3.5-turbo",
  //     messages: [
  //       prompt,
  //       message,
  //       {
  //         role: "function",
  //         content: funcRes,
  //         name: functionCall.name,
  //       },
  //     ],
  //   });
  //   console.log("answer", res2.data.choices[0]);
  //   const responseMessage = res2.data.choices[0].message;

  if (functionCall) {
    const args =JSON.parse(functionCall.arguments || "{}");

    // @ts-ignore
    const funcRes = functions[functionCall.name](args.description);

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
      functions:[
        {
          name: "ToSummarize",
          description:"文章の内容を伐採して５文字にしてください。 例、○○で○○。 動作で状態。",
          parameters:{
            type: "object",
            properties:{
              name:{
                type:"string",
                description:"文章の内容を伐採して５文字にしてください。 例、○○で○○。 動作で状態",
              },
            },
            require:["name"],
          },
        },
      ]
    });
    const responseMessage = res2.data.choices[0].message;
    console.log("answer", responseMessage);


    // getRecommend_bookが使われた場合に内容をツイートする
    if(message?.function_call?.name === 'getRecommend_book' && prompt.content?.includes("ツイートして")){
        const argumentsJson = JSON.parse(message.function_call.arguments || "{}");
        const tweetContent = `おすすめの本: ${argumentsJson.title}\n${argumentsJson.description}`;
        await runplaywrightTweet(tweetContent);
    }
    
     if (responseMessage?.function_call?.arguments  && prompt.content?.includes("ツイートして")){
        const argumentsJson = JSON.parse(responseMessage.function_call.arguments || "{}");
        const tweetContent = `${argumentsJson.name}`;
        // const tweetContent = responseMessage.content
        await runplaywrightTweet(tweetContent)
    }

    else if (message?.function_call?.name  ==='ToSummarize'){
      const argumentsJson = JSON.parse(message.function_call.arguments || "{}");
      const tweetContent = `${argumentsJson.name}`;
      await runplaywrightTweet(tweetContent);
    };

  };
} catch (error){
  console.error("Error", (error as any).message);
}
};


func();

