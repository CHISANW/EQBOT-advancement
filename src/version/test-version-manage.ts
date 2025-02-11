import fs from 'fs';
import xlsx from 'xlsx-js-style';
import 'reflect-metadata';
import { Config } from '../config/environment/config';

interface IWorkSheetObj {
  sheetName: string;
  summaryRow: any[];
  failRows: any[];
  detailRows: any[];
}

interface IFailResultObj {
  file: string;
  subTitle: string;
  description: string;
}

if (process.argv.slice(2)[0] !== '--version') {
  console.error('Invalid command');
  process.exit(1);
}

const VERSION = process.argv.slice(2)[1];
if (!VERSION) {
  console.error('Invalid version');
  process.exit(1);
}

const dir = `src/version/test/report/${Config.getEnvironment().NODE_ENV}/`;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const init = () => {
  let isPassed = true;

  const jsonData = JSON.parse(
    fs.readFileSync('src/version/test/test-report.json', 'utf8'),
  );

  const workbook = xlsx.utils.book_new();

  const workSheetObjs: IWorkSheetObj[] = [];
  const failResultObjs: IFailResultObj[] = [];

  const extractDataFrom = (testCase: any) => {
    const rows = [];
    const failRows = [];
    let failIdx = 1;
    testCase.assertionResults.forEach((assertion: any, index: number) => {
      let dataObj = {};
      dataObj = {
        number: index + 1,
        subTitle: assertion.ancestorTitles.slice(-1)[0],
        status: assertion.status,
        description: assertion.title,
      };
      if (assertion.status === 'failed') {
        const failObj = {
          number: failIdx,
          subTitle: assertion.ancestorTitles.slice(-1)[0],
          status: assertion.status,
          description: assertion.title,
          errorLocation: extractErrorLocation(
            assertion.failureMessages[0],
            testCase.name,
          ),
          errorMessages:
            assertion.failureDetails[0].matcherResult.message.replace(
              /\x1B\[\d+m/g,
              '',
            ),
        };
        failRows.push(failObj);
        failResultObjs.push({
          file: extractFileName(testCase.name, false),
          subTitle: assertion.ancestorTitles.slice(-1)[0],
          description: assertion.title,
        });
        failIdx++;
      }
      if (index === 0) {
        dataObj['majorTitle'] = assertion.ancestorTitles[0];
      }
      rows.push(dataObj);
    });

    return {
      detailRows: rows,
      failRows,
    };
  };

  jsonData.testResults.forEach((testCase: any, index: number) => {
    const { detailRows, failRows } = extractDataFrom(testCase);
    const count = testCase.assertionResults.length;
    const summaryRow = [
      {
        version: VERSION,
        totalStatus: testCase.status,
        pass: count - failRows.length,
        fail: failRows.length,
        rate: `${Math.round(((count - failRows.length) / count) * 10000) / 100}%`,
      },
    ];

    workSheetObjs.push({
      sheetName: extractFileName(testCase.name, true),
      summaryRow,
      failRows,
      detailRows,
    });
  });

  // 종합 결과 데이터 워크시트 생성
  const summaryWorksheet = xlsx.utils.json_to_sheet([]);
  const summaryHeader = ['total', 'pass', 'fail', 'rate'];
  const summaryRow = [
    {
      total: jsonData.numTotalTests,
      pass: jsonData.numPassedTests,
      fail: jsonData.numFailedTests,
      rate: `${
        Math.round((jsonData.numPassedTests / jsonData.numTotalTests) * 10000) /
        100
      }%`,
    },
  ];

  xlsx.utils.sheet_add_json(summaryWorksheet, summaryRow, {
    origin: -1,
    header: summaryHeader,
  });

  for (let i = 0; i < summaryHeader.length; i++) {
    summaryWorksheet[`${shiftCharacter('A', i)}2`].s = headerStyle('cacdfe');
  }

  xlsx.utils.book_append_sheet(workbook, summaryWorksheet, 'Total summary');

  // 실패 항목 존재 시 실패 결과 데이터 워크시트 생성
  if (jsonData.numFailedTests !== 0) {
    const failResultWorksheet = xlsx.utils.json_to_sheet([]);
    const failResultHeader = ['number', 'file', 'subTitle', 'description'];

    for (const obj of failResultObjs) {
      const number = failResultObjs.indexOf(obj) + 1;
      failResultObjs[failResultObjs.indexOf(obj)]['number'] = number;
    }

    xlsx.utils.sheet_add_json(failResultWorksheet, failResultObjs, {
      origin: -1,
      header: failResultHeader,
    });

    for (let i = 0; i < failResultHeader.length; i++) {
      failResultWorksheet[`${shiftCharacter('A', i)}2`].s =
        headerStyle('ff5c5a');
    }

    const fwscols = [{ wch: 10 }, { wch: 20 }, { wch: 25 }, { wch: 50 }];
    failResultWorksheet['!cols'] = fwscols;

    xlsx.utils.book_append_sheet(workbook, failResultWorksheet, 'Fail list');
    isPassed = false;
  }

  // 각 테스트 결과 데이터 워크시트 생성
  for (const obj of workSheetObjs) {
    const headerCells = [];
    const failHeaderCells = [];
    const worksheet = xlsx.utils.json_to_sheet([]);
    const summaryHeader = ['version', 'totalStatus', 'pass', 'fail', 'rate'];
    obj.summaryRow.push({});
    xlsx.utils.sheet_add_json(worksheet, obj.summaryRow, {
      origin: -1,
      header: summaryHeader,
    });

    for (let i = 0; i < summaryHeader.length; i++) {
      headerCells.push(`${shiftCharacter('A', i)}2`);
    }

    if (obj.failRows.length !== 0) {
      xlsx.utils.sheet_add_json(worksheet, [], {
        origin: -1,
        header: ['fail list'],
      });
      failHeaderCells.push('A5');

      obj.failRows.push({});
      const failHeader = [
        'number',
        'majorTitle',
        'subTitle',
        'status',
        'description',
        'errorLocation',
        'errorMessages',
      ];
      xlsx.utils.sheet_add_json(worksheet, obj.failRows, {
        origin: -1,
        header: failHeader,
      });

      for (let i = 0; i < failHeader.length; i++) {
        failHeaderCells.push(`${shiftCharacter('A', i)}6`);
      }
    }

    const detailHeader = [
      'number',
      'majorTitle',
      'subTitle',
      'status',
      'description',
    ];

    xlsx.utils.sheet_add_json(worksheet, obj.detailRows, {
      origin: -1,
      header: detailHeader,
    });

    for (let i = 0; i < detailHeader.length; i++) {
      headerCells.push(
        `${shiftCharacter('A', i)}${5 + (obj.failRows.length === 0 ? 0 : obj.failRows.length + 2)}`,
      );
    }

    headerCells.forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = headerStyle('cacdfe');
      }
    });

    failHeaderCells.forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = headerStyle('ff5c5a');
      }
    });

    const wscols = [
      { wch: 10 },
      { wch: 15 },
      { wch: 25 },
      { wch: 10 },
      { wch: 50 },
      { wch: 10 },
      { wch: 100 },
    ];
    worksheet['!cols'] = wscols;
    xlsx.utils.book_append_sheet(workbook, worksheet, obj.sheetName);
  }

  xlsx.writeFile(workbook, `${dir}unit-test-report_v${VERSION}.xlsx`);
  console.log('Test report excel file has been created');
  fs.rmSync('src/version/test/test-report.json');

  if (isPassed) {
    // 다음 스크립트 실행
  }
};

const headerStyle = (rgb: string) => {
  return {
    alignment: {
      vertical: 'center',
      horizontal: 'center',
    },
    font: {
      italic: true,
    },
    fill: {
      fgColor: { rgb },
    },
    border: {
      top: {
        style: 'thin',
        color: 'gray',
      },
      left: {
        style: 'thin',
        color: 'gray',
      },
      bottom: {
        style: 'thin',
        color: 'gray',
      },
      right: {
        style: 'thin',
        color: 'gray',
      },
    },
  };
};
const extractFileName = (filePath: string, pure: boolean) => {
  const parts = filePath.split('/');
  const lastPart = parts[parts.length - 1];
  if (!pure) {
    return lastPart;
  }
  const fileName = lastPart.split('.spec')[0];

  return fileName;
};

const prettierDuration = (duration: number) => {
  const seconds = duration / 1000;
  return `${seconds} s`;
};

const extractErrorLocation = (failureMessage: string, filePath: string) => {
  let parts = failureMessage.split(filePath);
  parts = parts[1].split(')');
  return parts[0].slice(1);
};

const shiftCharacter = (char: string, shift: number) => {
  const charCode = char.charCodeAt(0);
  const newCharCode = charCode + shift;
  const newChar = String.fromCharCode(newCharCode);

  return newChar;
};

init();
