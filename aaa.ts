import { test } from "node:test";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import * as dotenv from 'dotenv'
dotenv.config();

const apiKey = process.env.API_KEY;

const configuration = new Configuration({
  apiKey
});
const openai = new OpenAIApi(configuration);

//オセロの候補地の配列・入力部分
const indiate = "[[1,2],[3,2],[2,4],[5,3]]"


const prompt: ChatCompletionRequestMessage = {
  role: "user",
  content:indiate
};
const getRandomList = (content: string) => {
    if(content){
        return "要素"
      }else{
        return "コンテンツがありません";
      }
  };


  interface functionMAP {
    [key: string]: (content: string) => string;
  }

const functions: functionMAP = {
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
        description: "並べられた要素（2次元配列）からランダムに一つの要素を選んでその結果だけ表示してください。 例[1,1]の結果だけ表示",
        parameters: {
          type: "object",
          properties: {
            lists: {
              type: "string", 
              description: "並べられた文字列（二次元配列）",
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
  
    const inputString = message2?.content
    console.log("stringの結果:",inputString)
    
    if(inputString === undefined){
        console.log("inputStringはundifind")
        return;
    }
    
    const result = JSON.parse(inputString) as number[];
    console.log("配列型array", result);
    
  }

  
  
};

func();