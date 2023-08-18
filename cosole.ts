// anotherFile.ts
import { resultHandler } from "./resultHandler";
import { func } from "./aaa1";

console.log("aaa",func([[1,2],[2,3],[2,4]]));

// const waitForResult = async () => {
//   return new Promise<void>((resolve) => {
//     const interval = setInterval(() => {
//       const result = resultHandler.getResult();
//       if (result) {
//         clearInterval(interval);
//         resolve();
//       }
//     }, 100); // 0.1秒ごとにチェック
//   });
// };

// (async () => {
//   await waitForResult();
//   const result = resultHandler.getResult();
//   if (result) {
//     console.log('result の値:', result);
//   } else {
//     console.log('result の値はまだ設定されていません。');
//   }
// })();