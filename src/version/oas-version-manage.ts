import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../app.module';
import fs from 'fs';
import exceljs from 'exceljs';
import { makeDir, makePath, checkDirectoryEmpty, checkInitialVersion } from '../utils/path';
import {
    createOuterBorder,
    setAlignment,
    setBorderBold,
    setHeaderBold,
    setBgColorAndFontBold,
} from '../utils/excel-style';
import diff from 'deep-diff';
import semver from 'semver';
import { Config } from 'src/config/environment/config';

function validateArgs() {
    const args = process.argv.slice(2);

    const version = args[1];

    if (!version) {
        console.error('please enter --version option');
        process.exit(1);
    }

    return version;
}

async function generateSwaggerToJson(version: string) {
    // swagger json 파일 생성
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle(`[${Config.getEnvironment().SERVICE_NAME}] API Documentation`)
        .setVersion(version)
        .build();
    const document = SwaggerModule.createDocument(app, config);

    // directory 생성
    const filePath = makePath(__dirname, ['json'], `OAS_v${version}.json`);
    makeDir(filePath);

    // json 파일 생성
    try {
        fs.writeFileSync(filePath, JSON.stringify(document, null, 2), 'utf-8');
        console.log(`File has been written to ${filePath}`);
    } catch (err) {
        console.error('Error writing file: ', err);
    }

    return { filePath };
}

async function readJsonFileSync(filePath) {
    const jsonFile = fs.readFileSync(filePath, 'utf8');

    return JSON.parse(jsonFile);
}

const exportDomainFromUrl = (url) => {
    const regex = /^(?:\/(?:api\/)?v\d+)?\/([^\/]+)/;

    const match = url.match(regex);

    if (!match) {
        console.error(`parse url failed. url: ${url}`);
        process.exit(1);
    }

    return match[1];
};

async function createApiList(workbook, swaggerJson) {
    const apiList = [];

    let rowNum = 1;
    for (const path in swaggerJson.paths) {
        for (const method in swaggerJson.paths[path]) {
            const url = path.split('.')[0];
            const domain = exportDomainFromUrl(url);

            const apiInfo = swaggerJson.paths[path][method];
            apiList.push({
                Number: `API_${apiInfo.apiId}`,
                Type: 'API',
                Domain: domain,
                URL: `[${method.toUpperCase()}] ${url}`,
                Summary: apiInfo.summary || '',
                Description: apiInfo.description || '',
                Note: '',
            });

            rowNum++;
        }
    }

    const worksheet = workbook.addWorksheet('API 리스트');
    worksheet.columns = [
        { header: '번호', key: 'Number', width: 10 },
        { header: '형태', key: 'Type', width: 5 },
        { header: '도메인', key: 'Domain', width: 15 },
        { header: 'URL', key: 'URL', width: 40 },
        { header: '기능명', key: 'Summary', width: 40 },
        { header: '내용', key: 'Description', width: 70 },
        { header: '비고', key: 'Note', width: 30 },
    ];
    worksheet.addRows(apiList);

    // cell style 설정
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
        row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
            if (worksheet.getColumn(colNumber).key !== 'URL') {
                setAlignment(cell, 'center');
            }

            setBorderBold(cell);
        });
    });
    createOuterBorder(worksheet, undefined, {
        row: rowNum,
        col: worksheet.columns.length,
    });
    setHeaderBold(worksheet);
}

function extractPathsReferencingSchema(json, schemaRef) {
    const paths = json.paths;
    const result = [];

    for (const path in paths) {
        for (const method in paths[path]) {
            const responses = paths[path][method].responses;
            for (const statusCode in responses) {
                const content = responses[statusCode].content;
                if (content) {
                    for (const mimeType in content) {
                        const schema = content[mimeType].schema;
                        if (schema) {
                            if (schema['$ref']?.includes(schemaRef)) {
                                result.push({
                                    method,
                                    path,
                                });
                            } else if (
                                schema.type === 'array' &&
                                schema.items &&
                                schema.items['$ref']?.includes(schemaRef)
                            ) {
                                result.push({
                                    method,
                                    path,
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    return result;
}

const parsePathArray = (paths: any[]) => {
    const excludeKeywords = ['paths', 'get', 'post', 'put', 'delete'];

    for (let i = paths.length - 1; i >= 0; i--) {
        if (excludeKeywords.includes(paths[i])) {
            paths.splice(i, 1);
        }
    }

    return paths;
};

async function createApiChanges(isInitialVersion, workbook, swaggerJson, version) {
    if (isInitialVersion) {
        const worksheet = workbook.addWorksheet('수정 내역');
        worksheet.columns = [
            { header: '수정항목', key: 'UpdatedItem', width: 10 },
            { header: '버전', key: 'Version', width: 10 },
            { header: '수정날짜', key: 'Date', width: 15 },
            { header: '수정내용', key: 'Content', width: 100 },
            { header: '변경 전', key: 'ChangeBefore', width: 50 },
            { header: '변경 후', key: 'ChangeAfter', width: 50 },
        ];

        const row = {
            UpdatedItem: '전체',
            Version: version,
            Date: new Date().toISOString().split('T')[0],
            Content: '최초 작성',
            ChangeBefore: '',
            ChangeAfter: '',
        };
        worksheet.addRow(row);

        const rowCount = worksheet.rowCount;

        // cell style 설정
        worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
            row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                setBorderBold(cell);
            });
        });
        createOuterBorder(worksheet, undefined, {
            row: rowCount,
            col: worksheet.columns.length,
        });
        setHeaderBold(worksheet);
    } else {
        // 이전 수정 내역 조회 및 저장
        const sheetName = '수정 내역';

        const excelLatestVersion = getExcelLatestVersion();
        const previousExcelFilePath = makePath(
            __dirname,
            ['excel'],
            `API_v${excelLatestVersion}.xlsx`,
        );

        const sourceWorkbook = new exceljs.Workbook();
        await sourceWorkbook.xlsx.readFile(previousExcelFilePath);
        const sourceSheet = sourceWorkbook.getWorksheet(sheetName);

        const targetSheet = workbook.addWorksheet(sheetName);
        targetSheet.columns = [
            { header: '수정항목', key: 'UpdatedItem', width: 10 },
            { header: '버전', key: 'Version', width: 10 },
            { header: '수정날짜', key: 'Date', width: 15 },
            { header: '수정내용', key: 'Content', width: 100 },
            { header: '변경 전', key: 'ChangeBefore', width: 50 },
            { header: '변경 후', key: 'ChangeAfter', width: 50 },
        ];

        // 원본 시트의 모든 행을 대상으로 데이터 복사
        sourceSheet.eachRow((row, rowNumber) => {
            const targetRow = targetSheet.getRow(rowNumber);
            row.eachCell((cell, colNumber) => {
                const targetCell = targetRow.getCell(colNumber);
                targetCell.value = cell.value;
            });
            targetRow.commit();
        });

        //* 테스트//////////////////////////////////////////////////
        // const v1Path = __dirname + '/json/OAS_v1.0.0.json';
        // const v2Path = __dirname + '/json/OAS_v1.0.1.json';
        //
        // const previousVersionSwaggerJson = JSON.parse(fs.readFileSync(v1Path, 'utf8'));
        // const latestVersionSwaggerJson = JSON.parse(fs.readFileSync(v2Path, 'utf8'));
        // const differences = diff(previousVersionSwaggerJson, latestVersionSwaggerJson);
        //* 테스트//////////////////////////////////////////////////

        // 이전 버전 조회
        const { previousVersion, latestVersion } = getLatestVersion();

        // OAS JSON 파일 로드
        const previousFilePath = makePath(__dirname, ['json'], `OAS_v${previousVersion}.json`);
        const previousVersionSwaggerJson = await readJsonFileSync(previousFilePath);

        const latestFilePath = makePath(__dirname, ['json'], `OAS_v${latestVersion}.json`);
        const latestVersionSwaggerJson = await readJsonFileSync(latestFilePath);

        // 차이점 계산
        const differences = diff(previousVersionSwaggerJson, latestVersionSwaggerJson);
        // console.log('differences', differences)

        // 변경 내용 분석
        const changes = [];

        if (differences) {
            differences.forEach((difference) => {
                const change = {
                    UpdatedItem: '',
                    Version: version,
                    Date: new Date().toISOString().split('T')[0],
                    Content: '',
                    ChangeBefore: '',
                    ChangeAfter: '',
                };

                if (difference.kind === 'N') {
                    if (difference.path.includes('paths')) {
                        // request parameter
                        const method =
                            difference.path[2] &&
                            ['get', 'post', 'put', 'delete'].includes(difference.path[2])
                                ? difference.path[2]
                                : Object.keys(difference.rhs)[0];
                        change.UpdatedItem = `API_${latestVersionSwaggerJson.paths[difference.path[1]][method].apiId || ''}`;

                        change.Content = `[추가된 API] ${difference.path ? parsePathArray(difference.path).join('.') : ''}`;

                        changes.push(change);
                    } else if (
                        difference.path.includes('components') &&
                        difference.path.includes('schemas')
                    ) {
                        // response parameter
                        const ref = difference.path[2];

                        const results = extractPathsReferencingSchema(
                            latestVersionSwaggerJson,
                            ref,
                        );
                        for (const result of results) {
                            const path = result.path;
                            const method = result.method;

                            change.UpdatedItem = `API_${latestVersionSwaggerJson.paths[path][method].apiId || ''}`;
                            change.Content = `[추가된 Params] ${difference.path[difference.path.length - 1]}`;

                            changes.push(change);
                        }
                    }
                } else if (difference.kind === 'D') {
                    const method =
                        difference.path[2] &&
                        ['get', 'post', 'put', 'delete'].includes(difference.path[2])
                            ? difference.path[2]
                            : Object.keys(difference.lhs)[0];
                    change.UpdatedItem = `API_${previousVersionSwaggerJson.paths[difference.path[1]][method].apiId || ''}`;

                    change.Content = `[삭제된 API] ${difference.path ? parsePathArray(difference.path).join('.') : ''}`;

                    changes.push(change);
                } else if (difference.kind === 'E') {
                    // 'E' 중 파라미터 외에 변경 내용들은 skip
                    if (
                        difference.path.includes('properties') ||
                        (difference.path.includes('paths') && difference.path.includes('name'))
                    ) {
                        const method = Object.keys(
                            latestVersionSwaggerJson.paths[difference.path[1]],
                        )[0];
                        change.UpdatedItem = `API_${latestVersionSwaggerJson.paths[difference.path[1]][method].apiId || ''}`;

                        change.Content = `[수정된 API] ${difference.path ? parsePathArray(difference.path).join('.') : ''}`;

                        change.ChangeBefore = JSON.stringify(difference.lhs);
                        change.ChangeAfter = JSON.stringify(difference.rhs);

                        changes.push(change);
                    }
                } else if (difference.kind === 'A') {
                    const path = difference.path[1];
                    const method = difference.path[2];
                    change.UpdatedItem = `API_${latestVersionSwaggerJson.paths[path][method].apiId || ''}`;
                    if (difference.item.kind === 'N') {
                        change.Content = `[추가된 Params] ${difference.item.rhs.name || ''}`;
                    } else if (difference.item.kind === 'D') {
                        change.Content = `[삭제된 Params] ${difference.item.lhs.name || ''}`;
                    }

                    changes.push(change);
                }
            });
        }

        // console.log('changes', changes);

        targetSheet.addRows(changes);

        const rowCount = targetSheet.rowCount;

        // cell style 설정
        targetSheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
            row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                setBorderBold(cell);
            });
        });
        createOuterBorder(targetSheet, undefined, {
            row: rowCount,
            col: targetSheet.columns.length,
        });
        setHeaderBold(targetSheet);
    }
}

async function createApiDetailBasicSection(worksheet, rowNum, apiInfo, apiId, method, path) {
    // 번호 섹션
    worksheet.getCell(`A${rowNum}`).value = '번호';
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`A${++rowNum}`).value = `API_${apiId}`;
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);

    // OperationId 섹션
    worksheet.getCell(`A${++rowNum}`).value = 'operationId';
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`A${++rowNum}`).value = apiInfo.operationId || '';
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);

    // 기능명 섹션
    worksheet.getCell(`A${++rowNum}`).value = '기능명';
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`A${++rowNum}`).value = apiInfo.summary || '';
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);

    // 내용 섹션
    worksheet.getCell(`A${++rowNum}`).value = '내용';
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`A${++rowNum}`).value = apiInfo.description || '';
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);

    // 요청 섹션
    worksheet.getCell(`A${++rowNum}`).value = '요청';
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`A${++rowNum}`).value = '형태';
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`B${rowNum}`).value = 'URL';
    worksheet.mergeCells(`B${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`B${rowNum}`), 'D9D9D9');

    const url = path.split('.')[0];
    worksheet.getCell(`A${++rowNum}`).value = method?.toUpperCase() || '';
    worksheet.getCell(`B${rowNum}`).value = url || '';
    worksheet.mergeCells(`B${rowNum}:H${rowNum}`);

    return rowNum;
}

async function createApiDetailHeaderSection(worksheet, rowNum, apiInfo) {
    worksheet.getCell(`A${++rowNum}`).value = '헤더';
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`A${++rowNum}`).value = '필드명';
    worksheet.mergeCells(`A${rowNum}:B${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`C${rowNum}`).value = '타입';
    setBgColorAndFontBold(worksheet.getCell(`C${rowNum}`), 'D9D9D9');

    worksheet.getCell(`D${rowNum}`).value = '설명';
    worksheet.mergeCells(`D${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`D${rowNum}`), 'D9D9D9');

    let mediaType;
    if (apiInfo.requestBody) {
        const content = apiInfo.requestBody.content;
        mediaType = Object.keys(content)[0];
    }

    worksheet.insertRow(++rowNum, [
        'Content-Type',
        '',
        'string',
        mediaType ? mediaType : 'application/json',
    ]);
    worksheet.mergeCells(`A${rowNum}:B${rowNum}`);
    worksheet.mergeCells(`D${rowNum}:H${rowNum}`);

    if (apiInfo.security) {
        worksheet.insertRow(++rowNum, ['apiKey', '', 'string', '사정 정의된 제휴사키']);
        worksheet.mergeCells(`A${rowNum}:B${rowNum}`);
        worksheet.mergeCells(`D${rowNum}:H${rowNum}`);
    }

    return rowNum;
}

async function createApiDetailParamsSection(worksheet, rowNum, pathParams) {
    worksheet.getCell(`A${++rowNum}`).value = 'Params';
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`A${++rowNum}`).value = '필드명';
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`B${rowNum}`).value = 'Required';
    setBgColorAndFontBold(worksheet.getCell(`B${rowNum}`), 'D9D9D9');

    worksheet.getCell(`C${rowNum}`).value = '예시';
    setBgColorAndFontBold(worksheet.getCell(`C${rowNum}`), 'D9D9D9');

    worksheet.getCell(`D${rowNum}`).value = '타입';
    setBgColorAndFontBold(worksheet.getCell(`D${rowNum}`), 'D9D9D9');

    worksheet.getCell(`E${rowNum}`).value = 'Default';
    setBgColorAndFontBold(worksheet.getCell(`E${rowNum}`), 'D9D9D9');

    worksheet.getCell(`F${rowNum}`).value = 'Enum';
    setBgColorAndFontBold(worksheet.getCell(`F${rowNum}`), 'D9D9D9');

    worksheet.getCell(`G${rowNum}`).value = '설명';
    worksheet.mergeCells(`G${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`G${rowNum}`), 'D9D9D9');

    for (const param of pathParams) {
        const row = [];
        row[1] = String(param.name || '');
        row[2] = String(param.required ?? '');
        row[3] = String(param.example || '');
        row[4] = String(param.schema.type || '');
        row[5] = String(param.schema.default || '');
        row[6] = String(param.schema.enum || '');
        row[7] = String(param.description || '');

        worksheet.insertRow(++rowNum, row);
        worksheet.mergeCells(`G${rowNum}:H${rowNum}`);
    }

    return rowNum;
}

async function createApiDetailQuerySection(worksheet, rowNum, queryParams) {
    worksheet.getCell(`A${++rowNum}`).value = 'Query';
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`A${++rowNum}`).value = '필드명';
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`B${rowNum}`).value = 'Required';
    setBgColorAndFontBold(worksheet.getCell(`B${rowNum}`), 'D9D9D9');

    worksheet.getCell(`C${rowNum}`).value = '예시';
    setBgColorAndFontBold(worksheet.getCell(`C${rowNum}`), 'D9D9D9');

    worksheet.getCell(`D${rowNum}`).value = '타입';
    setBgColorAndFontBold(worksheet.getCell(`D${rowNum}`), 'D9D9D9');

    worksheet.getCell(`E${rowNum}`).value = 'Default';
    setBgColorAndFontBold(worksheet.getCell(`E${rowNum}`), 'D9D9D9');

    worksheet.getCell(`F${rowNum}`).value = 'Enum';
    setBgColorAndFontBold(worksheet.getCell(`F${rowNum}`), 'D9D9D9');

    worksheet.getCell(`G${rowNum}`).value = '설명';
    worksheet.mergeCells(`G${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`G${rowNum}`), 'D9D9D9');

    for (const query of queryParams) {
        const row = [];
        row[1] = String(query.name || '');
        row[2] = String(query.required ?? '');
        row[3] = String(query.example || '');
        row[4] = String(query.schema.type || '');
        row[5] = String(query.schema.default || '');
        row[6] = String(query.schema.enum || '');
        row[7] = String(query.description || '');

        worksheet.insertRow(++rowNum, row);
        worksheet.mergeCells(`G${rowNum}:H${rowNum}`);
    }

    return rowNum;
}

async function createApiDetailBodySection(worksheet, rowNum, bodyParams, schema) {
    worksheet.getCell(`A${++rowNum}`).value = 'Body';
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`A${++rowNum}`).value = '필드명';
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`B${rowNum}`).value = 'Required';
    setBgColorAndFontBold(worksheet.getCell(`B${rowNum}`), 'D9D9D9');

    worksheet.getCell(`C${rowNum}`).value = '예시';
    setBgColorAndFontBold(worksheet.getCell(`C${rowNum}`), 'D9D9D9');

    worksheet.getCell(`D${rowNum}`).value = '타입';
    setBgColorAndFontBold(worksheet.getCell(`D${rowNum}`), 'D9D9D9');

    worksheet.getCell(`E${rowNum}`).value = 'Default';
    setBgColorAndFontBold(worksheet.getCell(`E${rowNum}`), 'D9D9D9');

    worksheet.getCell(`F${rowNum}`).value = 'Enum';
    setBgColorAndFontBold(worksheet.getCell(`F${rowNum}`), 'D9D9D9');

    worksheet.getCell(`G${rowNum}`).value = '설명';
    worksheet.mergeCells(`G${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`G${rowNum}`), 'D9D9D9');

    // 스키마 탐색 함수
    function resolveRef(schema, ref) {
        const parts = ref.split('/').slice(1);
        let resolved = schema;
        for (const part of parts) {
            resolved = resolved[part];
        }
        return resolved;
    }

    function extractProperties(schema, obj, properties = {}) {
        for (const key in obj) {
            if (key === '$ref') {
                const resolved = resolveRef(schema, obj[key]);
                extractProperties(schema, resolved, properties);
            } else if (key === 'allOf') {
                for (const item of obj[key]) {
                    extractProperties(schema, item, properties);
                }
            } else if (key === 'properties') {
                Object.assign(properties, obj[key]);

                const objKeys = Object.keys(properties);
                const required = obj.required || [];
                objKeys.forEach((key) =>
                    required.includes(key)
                        ? (properties[key].required = true)
                        : (properties[key].required = false),
                );
            } else if (key === 'items' && obj.type === 'array') {
                extractProperties(schema, obj[key], properties);
            }
        }
        return properties;
    }

    function parsingRequestBodyParams(bodyParams) {
        if (!bodyParams) {
            return {};
        }

        const content = bodyParams.content;
        const mediaType = Object.keys(content)[0];
        const requestBodySchema = content[mediaType].schema;
        if (mediaType === 'application/octet-stream') {
            return {
                'application/octet-stream': {
                    type: 'string',
                    description: 'binary',
                },
            };
        }

        return extractProperties(schema, requestBodySchema);
    }

    const parsedBodyParams = parsingRequestBodyParams(bodyParams);

    for (const [key, value] of Object.entries(parsedBodyParams)) {
        const row = [];
        row[1] = String(key || '');
        row[2] = String(value['required'] ?? '');
        row[3] = String(value['example'] || '');
        row[4] = String(value['type'] || '');
        row[5] = String(value['schema']?.default || '');
        row[6] = String(value['schema']?.enum || '');
        row[7] = String(value['description'] || '');

        worksheet.insertRow(++rowNum, row);
        worksheet.mergeCells(`G${rowNum}:H${rowNum}`);
    }

    return rowNum;
}

async function createApiDetailsResponseSection(worksheet, rowNum, responses, schema) {
    worksheet.getCell(`A${++rowNum}`).value = '응답';
    worksheet.mergeCells(`A${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`A${++rowNum}`).value = '필드명';
    worksheet.mergeCells(`A${rowNum}:C${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`A${rowNum}`), 'D9D9D9');

    worksheet.getCell(`D${rowNum}`).value = 'Required';
    setBgColorAndFontBold(worksheet.getCell(`D${rowNum}`), 'D9D9D9');

    worksheet.getCell(`E${rowNum}`).value = '예시';
    setBgColorAndFontBold(worksheet.getCell(`E${rowNum}`), 'D9D9D9');

    worksheet.getCell(`F${rowNum}`).value = '타입';
    setBgColorAndFontBold(worksheet.getCell(`F${rowNum}`), 'D9D9D9');

    worksheet.getCell(`G${rowNum}`).value = '설명';
    worksheet.mergeCells(`G${rowNum}:H${rowNum}`);
    setBgColorAndFontBold(worksheet.getCell(`G${rowNum}`), 'D9D9D9');

    // 스키마 탐색 함수
    function resolveRef(schema, ref) {
        const parts = ref.split('/').slice(1);
        let resolved = schema;
        for (const part of parts) {
            resolved = resolved[part];
        }
        return resolved;
    }

    function extractProperties(schema, obj, parentKey = '', parentType = '') {
        let properties = [];

        if (!obj) {
            return properties;
        }

        if ('$ref' in obj) {
            const resolved = resolveRef(schema, obj['$ref']);
            properties = properties.concat(
                extractProperties(schema, resolved, parentKey, parentType),
            );
        } else if ('allOf' in obj) {
            if (parentKey && parentType !== 'array') {
                properties.push({
                    name: parentKey,
                    type: obj.type ?? 'object',
                    description: obj.description || '',
                    required: obj.required ?? '',
                });
            }

            obj.allOf.forEach((item) => {
                properties = properties.concat(
                    extractProperties(schema, item, parentKey, parentType),
                );
            });
        } else if (obj.type === 'array' && 'items' in obj) {
            const itemType = obj.items.type || 'object';
            properties.push({
                name: parentKey,
                type: `array of ${itemType}`,
                description: obj.description || '',
                required: obj.required ?? '',
            });
            properties = properties.concat(
                extractProperties(schema, obj.items, parentKey, 'array'),
            );
        } else if ('properties' in obj) {
            const objKeys = Object.keys(obj.properties);
            const required = obj.required || [];
            objKeys.forEach((key) =>
                required.includes(key)
                    ? (obj.properties[key].required = true)
                    : (obj.properties[key].required = false),
            );

            for (const key in obj.properties) {
                properties = properties.concat(
                    extractProperties(
                        schema,
                        obj.properties[key],
                        parentKey ? `${parentKey}.${key}` : key,
                    ),
                );
            }
        } else {
            if (parentKey && parentType !== 'array') {
                properties.push({
                    name: parentKey,
                    type: obj.type,
                    description: obj.description || '',
                    example: obj.example,
                    required: obj.required ?? '',
                });
            }
        }

        return properties;
    }

    function parsingResponseParams(responses, schema) {
        const responseSchemas = {};

        for (const status in responses) {
            // 성공 응답만 필터링
            if (status.startsWith('2')) {
                const content = responses[status].content;
                if (content) {
                    const mediaType = Object.keys(content)[0];
                    const responseSchema = content[mediaType].schema;
                    responseSchemas[status] = extractProperties(schema, responseSchema);
                }
            }
        }

        return responseSchemas;
    }

    const parsedResponseParams = parsingResponseParams(responses, schema);

    Object.keys(parsedResponseParams).forEach((status) => {
        parsedResponseParams[status].forEach((param) => {
            if (param.name) {
                const row = [];
                row[1] = String(param.name) || '';
                row[4] = param.required?.toString() ?? '';
                row[5] =
                    typeof param.example === 'number' || typeof param.example === 'boolean'
                        ? String(param.example)
                        : param.example ?? '';
                row[6] = String(param.type) || '';
                row[7] = String(param.description) || '';

                worksheet.insertRow(++rowNum, row);
                worksheet.mergeCells(`A${rowNum}:C${rowNum}`);
                worksheet.mergeCells(`G${rowNum}:H${rowNum}`);
            }
        });
    });

    return rowNum;
}

async function createApiDetails(workbook, swaggerJson) {
    for (const path in swaggerJson.paths) {
        for (const method in swaggerJson.paths[path]) {
            let rowNum = 1;

            const apiId = swaggerJson.paths[path][method].apiId;
            const worksheet = workbook.addWorksheet(`API_${apiId}`);

            const apiInfo = swaggerJson.paths[path][method];

            const pathParams = apiInfo.parameters.filter((param) => param.in === 'path');
            const queryParams = apiInfo.parameters.filter((param) => param.in === 'query');
            const bodyParams = apiInfo.requestBody;
            const responses = apiInfo.responses;

            worksheet.columns = [
                { header: 'A', key: 'A', width: 20 },
                { header: 'B', key: 'B', width: 20 },
                { header: 'C', key: 'C', width: 20 },
                { header: 'D', key: 'D', width: 20 },
                { header: 'E', key: 'E', width: 20 },
                { header: 'F', key: 'F', width: 20 },
                { header: 'G', key: 'G', width: 20 },
                { header: 'H', key: 'H', width: 20 },
            ];

            // 기본 섹션
            rowNum = await createApiDetailBasicSection(
                worksheet,
                rowNum,
                apiInfo,
                apiId,
                method,
                path,
            );
            // 헤더 섹션
            rowNum = await createApiDetailHeaderSection(worksheet, rowNum, apiInfo);
            // Params 섹션
            rowNum = await createApiDetailParamsSection(worksheet, rowNum, pathParams);
            // Query 섹션
            rowNum = await createApiDetailQuerySection(worksheet, rowNum, queryParams);
            // Body 섹션
            rowNum = await createApiDetailBodySection(worksheet, rowNum, bodyParams, swaggerJson);
            // 응답 섹션
            rowNum = await createApiDetailsResponseSection(
                worksheet,
                rowNum,
                responses,
                swaggerJson,
            );

            worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
                row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                    setBorderBold(cell);
                });
            });
            createOuterBorder(worksheet, undefined, {
                row: rowNum,
                col: worksheet.columns.length,
            });
        }
    }
}

function getLatestVersion() {
    const dirPath = makePath(__dirname, ['json'], undefined);
    const versionPattern = /^OAS_v(\d+\.\d+\.\d+)\.json$/;

    const files = fs.readdirSync(dirPath);

    const versions = files
        .map((file) => {
            const match = file.match(versionPattern);
            return match ? match[1] : null;
        })
        .filter((version) => version !== null)
        .sort(semver.compare);

    const latestVersion = versions[versions.length - 1];
    const previousVersion = versions.length > 1 ? versions[versions.length - 2] : null;

    return { previousVersion, latestVersion };
}

function getExcelLatestVersion() {
    const dirPath = makePath(__dirname, ['excel'], undefined);
    const versionPattern = /^API_v(\d+\.\d+\.\d+)\.xlsx$/;

    const files = fs.readdirSync(dirPath);

    const versions = files
        .map((file) => {
            const match = file.match(versionPattern);
            return match ? match[1] : null;
        })
        .filter((version) => version !== null)
        .sort(semver.compare);

    // 엑셀은 OAS JSON 파싱 프로세스 끝난 후 파일 쓰기하기 때문에 최신 버전은 excelLatestVersion 임.
    const excelLatestVersion = versions[versions.length - 1];
    const excelPreviousVersion = versions.length > 1 ? versions[versions.length - 2] : null;

    return excelLatestVersion;
}

async function numberingAndSortingOASJsonFile(isInitialVersion, swaggerJson, version) {
    /*
        API 를 구분할 수 있는 태그 (번호일 경우, API 가 새로 추가되거나 했을 때 기존 API 번호가 유지되어야 함.
            - 초기 버전 생성
                1. 번호 부여
                2. OAS JSON 파일에 lastApiId 저장
                3. OAS JSON 파일 덮어쓰기
            - 업데이트 버전 생성
                1. 이전 버전 조회
                2. path 를 기준으로 각 API 번호 찾아서 새로 생성한 버전 파일에 번호 매핑
                3. 새로 생성한 버전에 매핑된 번호가 없는 API 는 새로 추가된 버전이므로 lastApiId 조회하여 번호 부여 및 lastApiId 업데이트
                4. OAS JSON 파일 덮어쓰기
                5. API 번호로 정렬한 json 객체 반환
                  ex)
                    `paths: {
                      /v1/sample.get{
                        get: {..., apiId: '001'}
                      },
                      /v1/sample.post{
                        post: {..., apiId: '002'}
                      }
                    `}
    */

    if (isInitialVersion) {
        // API 번호 부여
        let apiNum = 1;
        for (const path in swaggerJson.paths) {
            for (const method in swaggerJson.paths[path]) {
                const formattedNumber = apiNum.toString().padStart(3, '0');

                const apiInfo = swaggerJson.paths[path][method];
                apiInfo['apiId'] = formattedNumber;

                apiNum++;
            }
        }

        // lastApiId 저장
        swaggerJson['lastApiId'] = apiNum;

        // OAS JSON 파일 덮어쓰기
        try {
            const filePath = makePath(__dirname, ['json'], `OAS_v${version}.json`);
            fs.writeFileSync(filePath, JSON.stringify(swaggerJson, null, 2), 'utf-8');
        } catch (err) {
            console.error('numberingAndSortingOASJsonFile Error: ', err);
        }

        return swaggerJson;
    } else {
        // 이전 버전 조회
        const { previousVersion, latestVersion } = getLatestVersion();

        const previousFilePath = makePath(__dirname, ['json'], `OAS_v${previousVersion}.json`);
        const previousVersionSwaggerJson = await readJsonFileSync(previousFilePath);

        // path 를 기준으로 각 API 번호 찾아서 새로 생성한 버전 파일에 번호 매핑
        let lastApiId = previousVersionSwaggerJson['lastApiId'];
        for (const path in swaggerJson.paths) {
            for (const method in swaggerJson.paths[path]) {
                const apiInfo = swaggerJson.paths[path][method];

                const previousApiInfo = previousVersionSwaggerJson.paths?.[path]?.[method];
                if (previousApiInfo) {
                    apiInfo['apiId'] = previousApiInfo.apiId;
                } else {
                    // 새로 생성한 버전에 매핑된 번호가 없는 API 는 새로 추가된 버전이므로 lastApiId 조회하여 번호 부여 및 lastApiId 업데이트
                    apiInfo['apiId'] = lastApiId.toString().padStart(3, '0');

                    lastApiId++;
                }
            }
        }
        swaggerJson['lastApiId'] = lastApiId;

        // OAS JSON 파일 덮어쓰기
        try {
            const filePath = makePath(__dirname, ['json'], `OAS_v${version}.json`);
            fs.writeFileSync(filePath, JSON.stringify(swaggerJson, null, 2), 'utf-8');
        } catch (err) {
            console.error('numberingAndSortingOASJsonFile Error: ', err);
        }

        // apiId를 기준으로 정렬
        const sortedPathSections = {};
        const paths = Object.keys(swaggerJson.paths);

        const pathsArray = [];
        for (const path of paths) {
            const methods = swaggerJson.paths[path];

            for (const method in methods) {
                pathsArray.push({
                    path: `${path}.${method}`,
                    method: {
                        [method]: methods[method],
                    },
                    apiId: methods[method].apiId,
                });
            }
        }

        pathsArray.sort((a, b) => a.apiId.localeCompare(b.apiId));

        // 정렬된 배열을 다시 객체로 변환하여 sortedSwaggerJson 에 저장
        pathsArray.forEach((item) => {
            sortedPathSections[item.path] = item.method;
        });

        const sortedSwaggerJson = {
            ...swaggerJson,
            paths: sortedPathSections,
        };

        return sortedSwaggerJson;
    }
}

async function generateExcelFromSwagger(
    isInitialVersion: boolean,
    swaggerJson: any,
    version: string,
) {
    // directory 생성
    const filePath = makePath(__dirname, ['excel'], `API_v${version}.xlsx`);
    makeDir(filePath);

    const parsedJson = await numberingAndSortingOASJsonFile(isInitialVersion, swaggerJson, version);

    const workbook = new exceljs.Workbook();

    // api list 생성
    await createApiList(workbook, parsedJson);
    // api 수정내역 생성
    await createApiChanges(isInitialVersion, workbook, parsedJson, version);
    // api details 생성
    await createApiDetails(workbook, parsedJson);

    await workbook.xlsx.writeFile(filePath);
}

async function parsingSwaggerJson(isInitialVersion, filePath, version) {
    const jsonData = await readJsonFileSync(filePath);

    await generateExcelFromSwagger(isInitialVersion, jsonData, version);
}

function isValidVersion(version) {
    const versionPattern = /^\d+\.\d+\.\d+$/;
    return versionPattern.test(version);
}

function checkVersionExists(dirPath, version) {
    // 디렉토리 존재하지 않을 경우 생성
    checkDirectoryEmpty(dirPath, true);

    // 버전 검증
    const versionPattern = new RegExp(`^OAS_v${version.replace('.', '\\.')}.json$`);

    const files = fs.readdirSync(dirPath);
    const versionExists = files.some((file) => versionPattern.test(file));

    if (versionExists) {
        console.error(`Version ${version} already exists`);

        return true;
    } else {
        console.log(`Version ${version} does not exist`);
    }
}

async function makeApiVersion() {
    console.time('makeApiVersion');

    // 명령어 입력된 argument 로 버전을 받아와 검증
    const version = validateArgs();

    // 버전 형식 검증
    if (!isValidVersion(version)) {
        console.error(`Invalid version format: ${version}`);
        process.exit(0);
    }

    // 이미 존재하는 버전인지 확인
    const dirPath = makePath(__dirname, ['json'], undefined);
    if (checkVersionExists(dirPath, version)) {
        process.exit(0);
    }

    // 초기 버전인지 확인
    const isInitialVersion = checkInitialVersion(dirPath);

    // swagger json 파일 생성
    const { filePath } = await generateSwaggerToJson(version);

    // swagger json 파일을 파싱하여 엑셀 파일 생성
    await parsingSwaggerJson(isInitialVersion, filePath, version);

    console.timeEnd('makeApiVersion');

    process.exit(0);
}

makeApiVersion();
