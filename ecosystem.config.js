module.exports = {
  apps: [
    {
      name: 'be-framework-nestjs',
      script: 'npm',
      args: ['run', 'start:test'],
    //   autorestart: false,
    },
  ],
};

// pm2 실행 환경에 따라 args, NODE_ENV를 설정 할 수 있습니다.
