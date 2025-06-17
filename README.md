# 워드 클라우드 생성기 🎨

텍스트를 입력하면 아름다운 워드 클라우드를 생성해주는 웹 애플리케이션입니다.

## 🌟 주요 기능

- **텍스트 분석**: 입력된 텍스트를 분석하여 단어 빈도를 계산
- **시각화**: 단어 빈도에 따라 크기가 다른 시각적 워드 클라우드 생성
- **커스터마이징**: 
  - 6가지 색상 테마 (기본, 블루, 그린, 웜톤, 쿨톤, 레인보우)
  - 3가지 글자 크기 옵션 (작게, 보통, 크게)
  - 5가지 폰트 선택
- **다운로드**: 생성된 워드 클라우드를 PNG 이미지로 저장
- **반응형 디자인**: 모바일과 데스크톱 모두 지원

## 🚀 시작하기

### 1. 파일 다운로드
프로젝트 파일들을 다운로드하거나 클론합니다.

### 2. 웹 서버 실행 (선택사항)
로컬에서 실행하려면:

```bash
# Node.js가 설치되어 있다면
npm install
npm run dev

# 또는 Python이 설치되어 있다면
python -m http.server 8000

# 또는 단순히 index.html을 브라우저로 열기
```

### 3. 사용 방법
1. 텍스트 입력 영역에 분석할 텍스트를 입력
2. 원하는 색상 테마, 글자 크기, 폰트 선택
3. "워드 클라우드 생성" 버튼 클릭
4. 생성된 이미지를 "이미지 다운로드" 버튼으로 저장

## 📁 파일 구조

```
wordcloud_web/
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일링
├── script.js           # JavaScript 로직
├── package.json        # 프로젝트 설정
└── README.md          # 프로젝트 설명서
```

## 🛠️ 기술 스택

- **HTML5**: 웹 페이지 구조
- **CSS3**: 스타일링 및 애니메이션
- **JavaScript (ES6+)**: 동적 기능
- **WordCloud2.js**: 워드 클라우드 생성 라이브러리

## ✨ 주요 특징

### 텍스트 처리
- 한글, 영문, 숫자 자동 인식
- 단어 빈도 분석
- 불용어 제거 기능
- 최대 50개 단어 표시

### 사용자 인터페이스
- 현대적이고 직관적인 디자인
- 부드러운 애니메이션 효과
- 반응형 레이아웃
- 실시간 미리보기

### 커스터마이징 옵션
- **색상 테마**: 6가지 미리 정의된 색상 조합
- **폰트 크기**: 작게/보통/크게 옵션
- **폰트 패밀리**: 5가지 폰트 선택

## 🎨 색상 테마

1. **기본**: 다채로운 컬러 조합
2. **블루**: 시원한 파란색 계열
3. **그린**: 자연스러운 녹색 계열
4. **웜톤**: 따뜻한 색상 조합
5. **쿨톤**: 차가운 색상 조합
6. **레인보우**: 무지개 색상

## 📱 반응형 지원

- 데스크톱: 최적화된 2열 레이아웃
- 태블릿: 조정된 1열 레이아웃
- 모바일: 완전 반응형 디자인

## 🔧 커스터마이징

### 색상 테마 추가
`script.js`의 `colorSchemes` 객체에 새로운 색상 배열을 추가할 수 있습니다:

```javascript
this.colorSchemes = {
    // 기존 테마들...
    custom: ['#color1', '#color2', '#color3', '#color4', '#color5', '#color6']
};
```

### 폰트 추가
HTML의 select 옵션에 새로운 폰트를 추가할 수 있습니다:

```html
<option value="YourFont">Your Font Name</option>
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙏 감사의 말

- [WordCloud2.js](https://github.com/timdream/wordcloud2.js) - 워드 클라우드 생성 라이브러리
- 모든 기여자들과 사용자들

---

**즐거운 워드 클라우드 생성하세요! 🎉**
