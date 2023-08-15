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

const board = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 0, 0, 0],
    [0, 0, 0, 1, 2, 3, 0, 0],
    [0, 0, 3, 2, 1, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

// const convertBoardToString = (board:number[][] = []) => {
//     let boardString = "";
  
//     for (const row of board) {
//       for (const cell of row) {
//         boardString += cell.toString();
//       }
//     }
  
//     return boardString;
//   };
// オセロの盤面を文字列で表現する関数
const convertBoardToString = (board:number[][] = []) => {
    let boardString = "";

    // 盤面の各行を処理
    for (const row of board) {
        // 各セルを処理
        for (const cell of row) {
            // セルの値に基づいて文字列を追加
            if (cell === 0) {
                boardString += "0"; // 空きマス
            } else if (cell === 1) {
                boardString += "1"; // 黒石
            } else if (cell === 2) {
                boardString += "2"; // 白石
            } else if (cell === 3) {
                boardString += "3"; // 候補地
            }
        }
        boardString += "\n"; // 行の終わり
    }

    return boardString;
};

const boardString = convertBoardToString(board);
console.log(boardString)

const prompt: ChatCompletionRequestMessage = {
  role: "user",
  content:boardString,
};
// const getBoard_X_Y = (content: number[][] = []) => {
//     // 仮の座標を返す例（ランダムな座標を返す）
//     for(let x = 0; x < 8; x++){
//         for(let y = 0; y < 8; y++){
//             if (board[x][y] === 3){
//                 return {x,y};
//             }
//         }
//     }
// }
    

const getBoard_X_Y = (content:string) => {
    // contentを適切に解析して最適な手を計算
    const x = "X座標"
    const y = "Y座標"
    const result = "x,y"
    return `${result}`; // 座標を返す
  };


  

const functions = {
    getBoard_X_Y
} as const;

const func = async () => {
  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [prompt],
    function_call: "auto",
    functions: [
      {
        name: "getBoard_X_Y",
        description: "オセロの最適な手をあなたが解釈してほしいです。盤面の中の候補地から最適な手を選びX,Y座標で返してほしいです。X,Y座標はそれぞれ0~7の値です。結果例(X,Y)=(○,○)",
        parameters: {
          type: "object",
          properties: {
            content: {
              type:"string",//引数を適切に解析させる
              description:"文字列に変換されたオセロの盤面です。\\nで改行しているとおもってください。0が空、1が黒色、2が白色,3が候補地です。一番左の数字0の(x,y)座標は(0,0)次は(1,0)(2,0)...(7,0),(0,1)(1,2),のように座標はきまっていき最後は(7,7)です",
              },
            },
          
          required: ["content"],
        },
      },
        // {
        //     name:"getBoard_X_Y",
        //     description:"オセロの最適な手を計算する関数です。結果として最適な場所を返します。引数の３の部分の座標を一つ選ぶということです。",
        //     parameters:{
        //         type:"object",
        //         properties:{
        //             content:{
        //                 type: "array",//board引数の情報
        //                 // description:"オセロの盤面です1が黒、2が白色、3が候補地を表しています",
        //                 items:{
        //                     type:"arry",
        //                     items:{
        //                         type:"number",
        //                     }
        //                 }
        //             },
        //         },
        //         require:["content"]
        //     }
        // }
    ],
  });

//   console.log(res.data.choices[0].message); // 選択した x 座標
//   console.log(res.data.choices[0].message); // 選択した y 座標

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
  
//     const result = message2?.content
//     console.log("最終的な結果:",result)
    
   }

  

};


func();