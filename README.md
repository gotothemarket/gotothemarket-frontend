# Go To Market

React + Vite 기반의 시장 정보 및 리뷰 플랫폼

## 환경 설정

### API 설정

프로젝트는 환경에 따라 다른 API URL을 사용합니다:

- **개발 환경**: `http://localhost:5173`
- **배포 환경**: `https://api.gotothemarket.site`

### 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# API Base URL
VITE_API_BASE_URL=https://api.gotothemarket.site

# 환경 설정
NODE_ENV=production
VITE_MODE=production
```

### 빌드 및 배포

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 빌드 미리보기
npm run preview
```

## 프로젝트 구조

```
src/
├── apis/           # API 관련 설정 및 함수들
│   ├── client.js   # HTTP 클라이언트
│   ├── apis.js     # API 엔드포인트 정의
│   └── config/     # API 설정 관리
├── components/      # 재사용 가능한 컴포넌트
├── pages/          # 페이지 컴포넌트
└── ...
```

## API 연동 구조

1. **client.js**: HTTP 메서드 (GET, POST, PATCH, DELETE) 제공
2. **apis.js**: 각 API 엔드포인트별 쿼리/뮤테이션 옵션 정의
3. **config/api.js**: 환경별 API 설정 관리
4. **queryClient.js**: React Query 클라이언트 설정
