import { test } from "node:test";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { escape } from "querystring";
import * as dotenv from 'dotenv'
dotenv.config();
// const playwright = require('playwright');
const axios = require('axios');

const apiKey = process.env.API_KEY;

const configuration = new Configuration({
  apiKey: "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",
//   apiKey
});
const openai = new OpenAIApi(configuration);



const prompt: ChatCompletionRequestMessage = {
  role: "user",
  content:
    "[[3,2][2,4][5,3]]"
};
const getRandomList = (content: string) => {
    if(content){
        return "リストの1要素"
      }else{
        return "コンテンツがありません";
      }
  };


  

const functions = {
    getRandomList
} as const;

const func = async () => {
  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [prompt],
    function_call: "auto",
    functions: [
      {
        name: "getRandomList",
        description: "並べられた要素からランダムに一つ選んでその結果だけ表示してください。 例[1,1]の結果だけ表示",
        parameters: {
          type: "object",
          properties: {
            lists: {
              type: "string", // 関数の戻り値を文字列として設定
              description: "並べられた要素からランダムに一つ選んでその結果だけ表示してください。 例[1,1]の結果だけ表示",
            },
          },
          required: ["lists"],
        },
      },
    ],
  });

  const message = res.data.choices[0].message;
  console.log("message",message)

  const functioncall = message?.function_call;


  //ファンクションコーリングの結果を返す
  if(functioncall){
    const args = JSON.parse(functioncall.arguments || "{}");

    // @ts-ignore
    const functionRes = functions[functioncall.name](args.lists);

    // 関数の結果をもとに再度質問
    const res2 = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        prompt,
        message,
        {
          role: "function",
          content: functionRes,
          name: functioncall.name,
        },
      ],
    });

    const message2 = res2.data.choices[0].message
    console.log("answer", message2);
  
    const result = message2?.content
    console.log("最終的な結果:",result)
    
  }

  
  
};

func();