import * as dotenv from 'dotenv';
import type { ChatCompletionRequestMessage } from 'openai';
import { Configuration, OpenAIApi } from 'openai';
// import { countthree } from './boardUseCase';
dotenv.config();


// const apiKey = process.env.API_KEY;

// const configuration = new Configuration({
//   apiKey,
// });

// const openai = new OpenAIApi(configuration);

// const indiate = countthree();
// const indiatestring = JSON.stringify(indiate) as string;

//オセロの候補地の配列・入力部分
// const indiate = '[[1,2],[3,2],[2,4],[5,3]]';

// const prompt: ChatCompletionRequestMessage = {
//   role: 'user',
//   content: indiate,
// };
// const getRandomList = (content: string) => {
//   if (content) {
//     return '要素';
//   } else {
//     return 'コンテンツがありません';
//   }
// };

// interface functionMAP {
//   [key: string]: (content: string) => string;
// }

// const functions:functionMAP= {
//   getRandomList,
// } as const;

export const func1 = async (aaa:number[][] = []) => {
  const apiKey = process.env.API_KEY;

  const configuration = new Configuration({
    apiKey,
  });

  const indiatestring = JSON.stringify(aaa) as string;

  const prompt: ChatCompletionRequestMessage = {
    role: 'user',
    content: indiatestring,
  };

  const openai = new OpenAIApi(configuration);


  const getRandomList = (content: string) => {
    if (content) {
      return '要素';
    } else {
      return 'コンテンツがありません';
    }
  };
  
  interface functionMAP {
    [key: string]: (content: string) => string;
  }
  
  const functions:functionMAP= {
    getRandomList,
  } as const;


  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [prompt],
    function_call: 'auto',
    functions: [
      {
        name: 'getRandomList',
        description:
          '並べられた要素（2次元配列）からランダムに一つの要素だけを選んでその結果だけ表示してください。 例[1,1]',
        parameters: {
          type: 'object',
          properties: {
            lists: {
              type: 'string',
              description: '並べられた文字列（二次元配列）',
            },
          },
          required: ['lists'],
        },
      },
    ],
  });

  const message = res.data.choices[0].message;
  // console.log('message', message);

  const functioncall = message?.function_call;

  if(!functioncall){
    console.log("funcはよびだされませんでした")
  }
  //ファンクションコーリングの結果を返す
  if (functioncall && typeof functioncall.name === 'string') {
    if (functioncall.arguments === undefined || functioncall === null) {
      return;
    }

    const args = JSON.parse(functioncall.arguments || '{}');

    const functionRes = functions[functioncall.name](args.lists);

    // 関数の結果をもとに再度質問
    const res2 = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        prompt,
        message,
        {
          role: 'function',
          content: functionRes,
          name: functioncall.name,
        },
      ],
    });

    const message2 = res2.data.choices[0].message;
    // console.log('answer', message2);

    const inputString = message2?.content;
    // console.log('stringの結果:', inputString);

    if (inputString === undefined) {
      // console.log('inputStringはundifind');
      return;
    }


    const result = JSON.parse(inputString) as number[];
    // console.log('配列型array', result);
    // return result

    if (
      Array.isArray(result) &&
      result.length === 2 &&
      typeof result[0] === 'number' &&
      typeof result[1] === 'number'
    ) {
      console.log(result)
      return result;
      
    } else {
      return undefined;
    }
    

  }
  
};

// func([[1,2],[3,4],[7,8]]);
// console.log("aaa",func1([[1,2],[2,3],[2,4]]));
