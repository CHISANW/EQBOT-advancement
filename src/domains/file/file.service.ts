import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  async writeToFile(content: string, uuid: any) {
    const filePath = this.getFilePath(uuid);

    // 기존 파일이 존재하면 라인 수 확인, 없으면 1부터 시작
    let lineNumber = 1;
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent
        .split('\n')
        .filter((line) => line.trim() !== '');
      lineNumber = lines.length + 1; // 기존 라인 수 + 1
    }

    const lineWithNumber = `${lineNumber}. ${content}\n`;
    fs.appendFile(filePath, lineWithNumber, (err) => {});
  }

  async deleteFile(uuid: any) {
    await fs.promises.unlink(this.getFilePath(uuid));
  }

  async getLineCount(uuid: any): Promise<number> {
    const filePath = this.getFilePath(uuid);

    if (!fs.existsSync(filePath)) {
      return 0; // 파일이 없으면 라인 수는 0
    }

    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return fileContent.split('\n').filter((line) => line.trim() !== '').length;
  }

  private getFilePath(uuid: any) {
    return path.join(process.cwd(), 'logs', `${uuid}.txt`);
  }
}
