// //感情的なキーワード
export const emotionalKeywords = ['絶望', '嫌気がさす', '深い孤独感', '自己嫌悪', '悲観的な気持ち'];

// 実際の文章
export const text = "朝、目が覚めると時計は10時を指していた。すでに遅刻していることに気づき、アラームをもう一度セットすることを忘れたことに悩まされながら起き上がる。シャワーを浴びて洋服を選ぼうとするが、鏡に映る自分の姿に満足できず、絶望的な気分になる。遅刻しながらキャンパスへ向かう途中、友達に連絡を取ろうとするが、誰も返事してくれない。彼らには自分が邪魔者になってしまうと疑いを持ち始める。授業に出ると、先生は自分の質問にスルーするか、無関心に答える。自分が無能だとさらに確信し、嫌気がさしてきた。お昼ごはんの時間になるが、一人でカフェテリアに入る勇気がわかず、食べることすら面倒に感じる。結局、自販機で買った飲み物とポテトチップスで満たすことにした。友達の写真がSNSにアップされるのを見ると、深い孤独感に襲われる。授業が終わると、一人で図書館へ行くことに決める。しかし、集中力が欠けているため、何時間もかかる予定の課題を終わらせることができず、ますます自己嫌悪に悩まされる。夜、ベッドに横たわって思い悩む。自分は何もできない人間だという現実が押し寄せ、涙が零れ落ちる。明日がどんなにつらくなるかを思いながら、悲観的な気持ちで眠りについた。"

// // 感情的な部分を抽出する関数
// const extractEmotionalText = (text: string, keywords: string[]):string[] =>{
//   const emotinalSentences:string[] = [];
//   const sentences = text.split('。'); //文章を文に分割

//   for(const sentence of sentences){
//     if(keywords.some(keyword => sentence.includes(keyword))){
//       emotinalSentences.push(sentence);
//     }
//   }
//   return emotinalSentences;
// };

// const emotinalSentences = extractEmotionalText(text, emotinalKeywords)

// console.log("感情的な文章を抜き取ったもの:", emotinalSentences);

export const extractEmotionalText = (text: string, keywords: string[]): string => {
    const emotinalSentences: string[] = [];
    const separators = ['。', '!', '?', '\n']; // 文章を分割する区切り文字
  
    // 区切り文字で文章を分割
    const sentences = text.split(new RegExp(`[${separators.join('')}]+`));
  
    for (const sentence of sentences) {
      if (keywords.some(keyword => sentence.includes(keyword))) {
        emotinalSentences.push(sentence);
      }
    }
    return emotinalSentences.join('');
  };
  
  
  // 以下はテキストを取得するコードの例です
  // テキストを適切な方法で取得し、text 変数に格納してください
  
  const emotionalSentences = extractEmotionalText(text, emotionalKeywords);
  console.log("感情的な部分:", emotionalSentences);

