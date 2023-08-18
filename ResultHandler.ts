// ResultHandler.ts
export class ResultHandler {
    private result: number[] | null = null;
  
    setResult(result: number[]): void {
      this.result = result;
    }
  
    getResult(): number[] | null {
      return this.result;
    }
  }

export const resultHandler = new ResultHandler();