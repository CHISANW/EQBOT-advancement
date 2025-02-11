# be-framework-nestjs
* 목적: NestJS기반 프레임워크 제작
* 주요 기능:
	* 기능 1
	* 기능 2
	* 기능 3

## 구축 환경
| 항목 |     내용     |
| :---: |:----------:|
| 언어 | Typescript |
| 프레임워크 |   NestJS   |
| 데이터베이스 |   Mysql    |

## 환경 변수
```bash
# port
SERVER_PORT=

# Database
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
DB_TYPE=

# rabbitmq
RABBIT_MQ_PROTOCOL=
RABBIT_MQ_HOST=
RABBIT_MQ_ID=
RABBIT_MQ_PASSWORD=
RABBIT_MQ_PORT=
RABBIT_MQ_ENVIRONMENT=
RABBIT_MQ_RETRY_COUNT=
RABBIT_MQ_QUEUE=
RABBIT_MQ_EXCHANGE=
RABBIT_MQ_ROUTING_KEY=

# SERVER_ENVIRONMENT
SERVER_ENVIRONMENT_ID=

# socket
SOCKET_URL=

# s3
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=
S3_NAME=

# Node environment
NODE_ENV=
```

## 설치 명령어
### prod 환경
```shell
npm i --save
```
### feature 환경
```shell
npm i --save
```

## 실행 명령어
### prod 환경
```shell
npm run start:prod
```
### feature 환경
```shell
npm run start:dev
```

## 외부 요청 서버
* Mysql
* RabbitMQ
* Redis