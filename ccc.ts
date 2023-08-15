import { test } from "node:test";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { escape } from "querystring";
import * as dotenv from 'dotenv'
dotenv.config();
// const playwright = require('playwright');
const axios = require('axios');

const apiKey = process.env.API_KEY;

const configuration = new Configuration({
   apiKey
});
const openai = new OpenAIApi(configuration);

const boarda = [
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

const board = convertBoardToString(boarda);
console.log(board)

const prompt: ChatCompletionRequestMessage = {
  role: "user",
  content:board,
};


const findBestMove=(content: string)=> {
    
    const lines = content.split('\\n');
    console.log("lines",lines);
    const board = lines.map(line => line.split('').map(Number));
    // const board = lines.map(line => line.split('').map(Number));
    console.log("boardの状況",board)
    
    const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
    const dy = [-1, 0, 1, -1, 1, -1, 0, 1];
    
    let bestX = -1;
    let bestY = -1;
    let maxFlips = -1;
    
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (board[x][y] !== 3) {
                continue; // Skip non-candidate cells
            }
            
            let flips = 0;
            
            for (let dir = 0; dir < 8; dir++) {
                let nx = x + dx[dir];
                let ny = y + dy[dir];
                let count = 0;
                
                while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && board[nx][ny] === 2) {
                    count++;
                    nx += dx[dir];
                    ny += dy[dir];
                }
                
                if (count > 0 && nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && board[nx][ny] === 1) {
                    flips += count;
                }
            }
            
            if (flips > maxFlips) {
                maxFlips = flips;
                bestX = x;
                bestY = y;
            }
        }
    }
    
    if (bestX === -1 || bestY === -1) {
        return "(No valid move)";
    } else {
        return `(X, Y) = (${bestX}, ${bestY})`;
    }
}



const functions = {
    // calculateOthelloMove
    findBestMove
} as const;

const func = async () => {
  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [prompt],
    function_call: "auto",
    functions: [
        {
            name: "calculateOthelloMove",
            description:"Calculate the best move in an Othello board.",
            parameters: {
                type: "object",
                properties: {
                  content: {
                    type: "string",
                    description: "The Othello board as a string.",
                  }
                },
                required: ["content"],
              },
           
        }
    ],
  });

//   console.log(res.data.choices[0].message); // 選択した x 座標
//   console.log(res.data.choices[0].message); // 選択した y 座標

  const message = res.data.choices[0].message;
  console.log("message",message)

  const functioncall = message?.function_call;

  console.log(functioncall)

  //ファンクションコーリングの結果を返す
  if(functioncall){
    const args = JSON.parse(functioncall.arguments || "{}");

    // @ts-ignore
    const functionRes = functions.findBestMove(args.content);

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