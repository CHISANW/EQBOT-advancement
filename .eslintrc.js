module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    "prettier",
    "airbnb-base",
  ],
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  rules: {
    /**
     * rule : 0 -> off
     * rule : 1 -> warn
     * rule : 2 -> error
     */
    
    "airbnb-base": 0,
    "prettier/prettier": 0,
    "no-return-await": 0,
    "func-names": 0,
    "import/order": 0,
    "indent": 0,
    "no-use-before-define": 0,
    // CodeConvention
    "no-var": 2,
    "no-new-object": 2,
    "object-shorthand": 2,
    "prefer-object-spread": 2,
    "no-array-constructor": 2,
    "prefer-destructuring": 2,
    "quotes": [2, "single"],
    "prefer-template": 2,
    "template-curly-spacing": 2,
    "no-eval": 2,
    "no-loop-func": 2,
    "default-param-last": 2,
    "space-before-function-paren": ["error", "always"],
    "space-before-blocks": 2,
    "no-param-reassign": 2,
    "function-paren-newline": 2,
    "arrow-parens": 2,
    "no-confusing-arrow": 2,
    "import/no-mutable-exports": 2,
    "object-curly-newline": 2,
    "import/extensions": 2,
    "no-iterator": 2,
    "no-restricted-syntax": 2,
    // "dot-notation": 2,
    "no-plusplus": 2,
    "operator-linebreak": 2,
    "eqeqeq": 2,
    "no-mixed-operators": 2,
    "nonblock-statement-body-position": 2,
    "brace-style": 2,
    "spaced-comment": 2,
    "keyword-spacing": 2,
    "space-infix-ops": 2,
    "computed-property-spacing": 2,
    "func-call-spacing": 2,
    "comma-spacing": 2,
    "space-in-parens": 2,
    "array-bracket-spacing": 2,
    "object-curly-spacing": [2, "always"],
    "no-multiple-empty-lines": 2,
    "comma-style": 2,
    "semi": 2,

    // 변경사항
    "no-unused-vars": 0, // 추가된 @typescript-eslint/no-unused-vars로 대체
    "quote-props": 2,
    "comma-dangle": [2, {
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "imports": "always-multiline",
      "exports": "always-multiline",
      "functions": "always-multiline"
    }],

    // 추가사항
    "import/prefer-default-export": "off", // export class 사용가능
    "import/no-extraneous-dependencies": ["off", {
      "devDependencies": true,
      "peerDependencies": true
    }], // package.json에 명시되지 않은 외부 패키지의 import를 제한하는 규칙 -> 해제 (express 패키지처럼 @nestjs/platform-express에 간접적으로 설치되어있을 수 있음)
    "@typescript-eslint/no-unused-vars": [2, {  // TypeScript 전용 규칙 사용
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
      "ignoreRestSiblings": true,
      "args": "after-used"
    }],
    "import/extensions": 0,
    "@typescript-eslint/no-explicit-any": "off",  // any 타입 허용
    "indent": ["error", 4, {
        "ignoredNodes": ["PropertyDefinition[decorators]", "TSUnionType"],
        "SwitchCase": 1
    }], // tap indent 설정 ( TypeScript에 맞게 적용 (데코레이터) )
    "max-classes-per-file": 0, // 클래스 당 최대 클래스 수 제한 무시
    "no-useless-constructor": "off", // 빈 생성자 허용
    "@typescript-eslint/no-useless-constructor": "off", // 빈 생성자 허용
    "no-empty-function": "off", // 빈 함수 허용 ( Class 주입 시 필요 )
    "@typescript-eslint/no-empty-function": "off", // 빈 함수 허용 ( Class 주입 시 필요 )
    "import/no-unresolved": "off", // TypeScript의 절대 경로 임포트 허용
    "class-methods-use-this": "off", // 클래스 메서드의 this 사용 강제
    "no-shadow": "off", // 현재 Eslint에서 Enum 사용 시 warning 발생
    "no-await-in-loop": 0, // 반복문내에서 await 사용 허용
    "camelcase": 0, // 변수명 카멜케이스 허용
    "consistent-return": 0, // 함수 반환값 일관성 허용 / try/catch 문에서 함수 반환값이 다를때에 타입 핸들링의 복잡성이 증가함
    "max-len": 0, // 줄 길이 제한 해제
    "no-console": 0, // console 사용 허용

    // 협의필요
    "dot-notation": 0, // 객체 접근 방법 협의필요
  },
  globals: {
    "NodeJS": false, // Global로 NodeJS환경을 명시하여 NodeJS 사용 허용
  }
};
