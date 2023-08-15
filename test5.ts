import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import * as dotenv from 'dotenv';
import { runplaywrightTweet } from "./usePlaywright";
import { emotionalKeywords, extractEmotionalText,text } from "./emotinal";
dotenv.config();

const apiKey = process.env.API_KEY;

const configuration = new Configuration({
  apiKey
});
const openai = new OpenAIApi(configuration);

const emotinalSentences = extractEmotionalText(text,emotionalKeywords);

const prompt: ChatCompletionRequestMessage = {
  role: "user",
  content: emotinalSentences,
};

// const ToSummarize = async (content: string):Promise<string> => {
//     if (content) {
//       const cleanContent = JSON.parse(content).text;
//       const maxSummaryLength = 20; // 最大要約文字数を設定（例えば20文字とします）
      
//       const res = await openai.createCompletion({
//         prompt: `Summarize the following text: "${cleanContent}"\nSummary:`,
//         max_tokens: 50, // 要約のトークン数を指定,
//         model: "text-davinci-003",
//       });
  
    
      // const summary = res.data.choices[0]?.text.trim();
      
      // 最大要約文字数を超える場合は、後ろの部分を削る
  //     if (summary.length > maxSummaryLength) {
  //       return `${summary.substring(0, maxSummaryLength)}...`;
  //     } else {
  //       return summary;
  //     }
  //   } else {
  //     return "コンテンツがありません";
  //   }
  // }

const functions = {
  // ToSummarize
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
];

const func = async () => {
  try {
    const res = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [prompt],
      function_call: "auto",
      functions: functionDefinition,
    });

    const message = res.data.choices[0].message;

    if (message?.function_call?.name === 'ToSummarize') {
      const argumentsJson = JSON.parse(message.function_call.arguments || "{}");
      // const summarizedText = ToSummarize(JSON.stringify(argumentsJson));
      // console.log("ToSummarize Result:", summarizedText);

      // await runplaywrightTweet(summarizedText)
    }

  } catch (error) {
    console.error("Error", (error as any).message);
  }
};

func();
