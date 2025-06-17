// 워드 클라우드 생성기 JavaScript

class WordCloudGenerator {
    constructor() {
        this.canvas = document.getElementById('wordcloud');
        this.ctx = this.canvas.getContext('2d');
        this.textInput = document.getElementById('textInput');
        this.urlInput = document.getElementById('urlInput');
        this.extractedText = document.getElementById('extractedText');
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.fetchBtn = document.getElementById('fetchBtn');
        this.placeholder = document.getElementById('placeholder');
        this.colorScheme = document.getElementById('colorScheme');
        this.fontSize = document.getElementById('fontSize');
        this.fontFamily = document.getElementById('fontFamily');
        this.urlStatus = document.getElementById('urlStatus');
        this.currentTab = 'text';
        
        this.colorSchemes = {
            default: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'],
            blue: ['#3498DB', '#2980B9', '#5DADE2', '#85C1E9', '#AED6F1', '#D6EAF8'],
            green: ['#27AE60', '#2ECC71', '#58D68D', '#82E0AA', '#A9DFBF', '#D5F4E6'],
            warm: ['#E74C3C', '#F39C12', '#F1C40F', '#E67E22', '#D35400', '#C0392B'],
            cool: ['#9B59B6', '#8E44AD', '#AF7AC5', '#BB8FCE', '#D2B4DE', '#E8DAEF'],
            rainbow: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']
        };
        
        this.init();
    }
      init() {
        this.generateBtn.addEventListener('click', () => this.generateWordCloud());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.fetchBtn.addEventListener('click', () => this.fetchWebPageText());
        
        // 탭 전환 이벤트
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // URL 입력 엔터 키 이벤트
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.fetchWebPageText();
            }
        });
        
        // 샘플 텍스트 설정
        this.textInput.value = `인공지능 머신러닝 데이터사이언스 프로그래밍 웹개발 모바일앱 클라우드컴퓨팅 사이버보안 
블록체인 빅데이터 자동화 API 데이터베이스 프론트엔드 백엔드 풀스택 개발자 소프트웨어 
알고리즘 자료구조 네트워크 서버 클라이언트 사용자경험 인터페이스 디자인 창의성 혁신 
기술 미래 디지털트랜스포메이션 스마트시티 IoT 가상현실 증강현실 로봇공학 자율주행`;
    }
    
    // 탭 전환
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // 탭 버튼 활성화 상태 변경
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // 탭 콘텐츠 표시/숨김
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        
        // URL 상태 초기화
        if (tabName === 'url') {
            this.urlStatus.textContent = '';
            this.urlStatus.className = 'url-status';
        }
    }
    
    // 웹페이지 텍스트 가져오기
    async fetchWebPageText() {
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showUrlStatus('URL을 입력해주세요.', 'error');
            return;
        }
        
        if (!this.isValidUrl(url)) {
            this.showUrlStatus('올바른 URL 형식이 아닙니다.', 'error');
            return;
        }
        
        this.fetchBtn.disabled = true;
        this.fetchBtn.textContent = '가져오는 중...';
        this.showUrlStatus('웹페이지 텍스트를 가져오고 있습니다...', 'loading');
        
        try {
            // 로컬 프록시 서버 시도 (개발 환경)
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                try {
                    const proxyResponse = await fetch(`http://localhost:3001/api/extract-text?url=${encodeURIComponent(url)}`);
                    if (proxyResponse.ok) {
                        const proxyData = await proxyResponse.json();
                        if (proxyData.success) {
                            this.extractedText.value = proxyData.text;
                            this.showUrlStatus(`성공적으로 ${proxyData.text.length}자의 텍스트를 추출했습니다.`, 'success');
                            return;
                        }
                    }
                } catch (proxyError) {
                    console.log('로컬 프록시 서버 사용 불가:', proxyError);
                }
            }
            
            // 업데이트된 공개 프록시 서비스들
            const proxyServices = [
                {
                    url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
                    extractData: (data) => data.contents
                },
                {
                    url: `https://cors-anywhere.herokuapp.com/${url}`,
                    extractData: (data) => data
                },
                {
                    url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
                    extractData: (data) => data
                },
                {
                    url: `https://thingproxy.freeboard.io/fetch/${url}`,
                    extractData: (data) => data
                },
                {
                    url: `https://cors.bridged.cc/${url}`,
                    extractData: (data) => data
                }
            ];
            
            let htmlContent = null;
            let lastError = null;
            
            // 각 프록시 서비스를 순차적으로 시도
            for (const service of proxyServices) {
                try {
                    console.log(`프록시 서비스 시도: ${service.url}`);
                    
                    const response = await fetch(service.url, {
                        method: 'GET',
                        headers: {
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        },
                        timeout: 10000
                    });
                    
                    if (response.ok) {
                        const responseData = await response.text();
                        
                        // JSON 응답인 경우 파싱
                        let data;
                        try {
                            data = JSON.parse(responseData);
                        } catch {
                            data = responseData;
                        }
                        
                        htmlContent = service.extractData(data);
                        
                        if (htmlContent && typeof htmlContent === 'string' && htmlContent.length > 100) {
                            console.log(`성공: ${service.url}`);
                            break;
                        }
                    }
                } catch (error) {
                    console.log(`프록시 실패: ${service.url}`, error);
                    lastError = error;
                    continue;
                }
            }
            
            if (!htmlContent || htmlContent.length < 100) {
                throw new Error('웹페이지 내용을 가져올 수 없습니다. CORS 정책이나 네트워크 문제일 수 있습니다.');
            }
            
            const extractedText = this.extractTextFromHtml(htmlContent);
            
            if (!extractedText || extractedText.length < 50) {
                throw new Error('웹페이지에서 충분한 텍스트를 추출할 수 없습니다.');
            }
            
            this.extractedText.value = extractedText;
            this.showUrlStatus(`성공적으로 ${extractedText.length}자의 텍스트를 추출했습니다.`, 'success');
            
        } catch (error) {
            console.error('웹페이지 텍스트 추출 오류:', error);
            this.showUrlStatus(`오류: ${error.message}`, 'error');
            
            // 대안 방법 제안
            this.extractedText.value = `웹페이지 텍스트 추출에 실패했습니다.

오류 내용: ${error.message}

해결 방법:
1. 웹페이지의 텍스트를 직접 복사하여 "직접 입력" 탭에 붙여넣으세요.
2. 다른 웹페이지 URL을 시도해보세요.
3. CORS 정책으로 인해 일부 웹사이트는 접근이 제한될 수 있습니다.
4. 로컬에서 실행하는 경우 브라우저의 CORS 정책을 비활성화하거나 로컬 프록시 서버를 사용해보세요.

테스트용 URL 예시:
- https://example.com
- https://wikipedia.org
- https://github.com`;
        } finally {
            this.fetchBtn.disabled = false;
            this.fetchBtn.textContent = '텍스트 가져오기';
        }
    }
    
    // URL 유효성 검사
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // HTML에서 텍스트 추출
    extractTextFromHtml(html) {
        try {
            // 임시 DOM 요소 생성
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // 스크립트, 스타일, 주석 등 불필요한 요소 제거
            const unwantedSelectors = [
                'script', 'style', 'nav', 'footer', 'aside', 'header',
                '.ads', '.advertisement', '.sidebar', '.menu', '.navigation',
                '.social', '.share', '.comment', '.related', '.popup',
                'iframe', 'noscript', 'form', 'button', 'input', 'select',
                '.cookie', '.banner', '.modal', '.overlay', '.tooltip',
                'meta', 'link', 'title', 'head'
            ];
            
            unwantedSelectors.forEach(selector => {
                try {
                    const elements = tempDiv.querySelectorAll(selector);
                    elements.forEach(el => el.remove());
                } catch (e) {
                    console.log(`선택자 ${selector} 처리 중 오류:`, e);
                }
            });
            
            // 주요 콘텐츠 영역 우선 탐색 (우선순위 순서)
            const contentSelectors = [
                'main', 'article', '.content', '.post', '.entry',
                '.article-body', '.post-content', '.entry-content',
                '.main-content', '.page-content', '.story-content',
                'section', 'div[role="main"]', '.text-content',
                'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th'
            ];
            
            let text = '';
            let extractedLength = 0;
            
            // 주요 콘텐츠 영역에서 텍스트 추출 시도
            for (const selector of contentSelectors) {
                const elements = tempDiv.querySelectorAll(selector);
                if (elements.length > 0) {
                    elements.forEach(el => {
                        const elementText = el.textContent || el.innerText || '';
                        const cleanText = elementText.trim();
                        
                        // 의미있는 텍스트만 추출 (최소 10자 이상)
                        if (cleanText.length > 10 && !/^\s*$/.test(cleanText)) {
                            // 중복 제거를 위한 간단한 체크
                            if (!text.includes(cleanText.substring(0, 20))) {
                                text += cleanText + ' ';
                                extractedLength += cleanText.length;
                            }
                        }
                    });
                    
                    // 충분한 텍스트가 확보되면 중단 (최소 500자)
                    if (extractedLength > 500) {
                        console.log(`충분한 텍스트 추출됨: ${extractedLength}자`);
                        break;
                    }
                }
            }
            
            // 주요 콘텐츠에서 텍스트를 찾지 못한 경우 전체 텍스트 사용
            if (text.length < 200) {
                console.log('주요 콘텐츠에서 충분한 텍스트를 찾지 못해 전체 텍스트 사용');
                text = tempDiv.textContent || tempDiv.innerText || '';
            }
            
            // 텍스트 정리 및 정제
            text = text
                .replace(/\s+/g, ' ') // 연속된 공백을 하나로
                .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣.,!?;:()\-]/g, ' ') // 한글, 영문, 숫자, 기본 문장부호만 유지
                .replace(/\b\w{1}\b/g, '') // 1글자 영문 단어 제거
                .replace(/\s+/g, ' ') // 다시 공백 정리
                .replace(/^\s+|\s+$/g, '') // 앞뒤 공백 제거
                .trim();
            
            // 최소 길이 체크
            if (text.length < 50) {
                console.log('추출된 텍스트가 너무 짧음:', text.length);
                return '';
            }
            
            console.log('추출된 텍스트 길이:', text.length);
            console.log('추출된 텍스트 미리보기:', text.substring(0, 200));
            
            return text;
            
        } catch (error) {
            console.error('HTML 텍스트 추출 오류:', error);
            return '';
        }
    }
    
    // URL 상태 메시지 표시
    showUrlStatus(message, type) {
        this.urlStatus.textContent = message;
        this.urlStatus.className = `url-status ${type}`;
    }
      // 텍스트 전처리 및 단어 빈도 계산
    processText(text) {
        // 한글, 영문, 숫자만 추출하고 공백으로 분리
        const words = text.match(/[가-힣a-zA-Z0-9]+/g) || [];
        
        // 단어 빈도 계산
        const wordCount = {};
        words.forEach(word => {
            if (word.length > 1) { // 1글자 단어 제외
                const lowerWord = word.toLowerCase();
                wordCount[lowerWord] = (wordCount[lowerWord] || 0) + 1;
            }
        });
        
        // 빈도순으로 정렬하고 상위 50개만 사용
        const sortedWords = Object.entries(wordCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 50);
        
        // 빈도 분포 정보 로깅
        if (sortedWords.length > 0) {
            console.log('=== 단어 빈도 분석 결과 ===');
            console.log(`총 고유 단어 수: ${Object.keys(wordCount).length}`);
            console.log(`최고 빈도: ${sortedWords[0][1]}회 (${sortedWords[0][0]})`);
            console.log(`최저 빈도: ${sortedWords[sortedWords.length-1][1]}회 (${sortedWords[sortedWords.length-1][0]})`);
            console.log('상위 10개 단어:', sortedWords.slice(0, 10));
        }
        
        return sortedWords;
    }
    
    // 색상 스키마 가져오기
    getColors() {
        const scheme = this.colorScheme.value;
        return this.colorSchemes[scheme] || this.colorSchemes.default;
    }
      // 폰트 크기 설정 가져오기
    getFontSizeSettings() {
        const size = this.fontSize.value;
        const settings = {
            small: { min: 14, max: 45 },
            medium: { min: 18, max: 70 },
            large: { min: 22, max: 100 }
        };
        return settings[size] || settings.medium;
    }
      // 워드 클라우드 생성
    async generateWordCloud() {
        let text = '';
        
        // 현재 활성 탭에 따라 텍스트 가져오기
        if (this.currentTab === 'text') {
            text = this.textInput.value.trim();
        } else if (this.currentTab === 'url') {
            text = this.extractedText.value.trim();
            if (!text || text.includes('웹페이지 텍스트 추출에 실패했습니다')) {
                alert('먼저 웹페이지에서 텍스트를 가져와주세요!');
                return;
            }
        }
        
        if (!text) {
            alert('텍스트를 입력하거나 웹페이지에서 텍스트를 가져와주세요!');
            return;
        }
        
        // 로딩 상태 표시
        this.generateBtn.textContent = '생성 중...';
        this.generateBtn.disabled = true;
        this.placeholder.style.display = 'none';
        this.canvas.style.display = 'block';
        
        try {
            const words = this.processText(text);
            const colors = this.getColors();
            const fontSizeSettings = this.getFontSizeSettings();
            const fontFamily = this.fontFamily.value;
              // wordcloud2.js를 사용하여 워드 클라우드 생성
            const wordList = words.map(([word, count], index) => {
                const maxCount = words[0][1]; // 최고 빈도
                const minCount = words[words.length - 1][1]; // 최저 빈도
                
                // 로그 스케일을 사용하여 더 극적인 크기 차이 만들기
                const logMax = Math.log(maxCount + 1);
                const logCount = Math.log(count + 1);
                const logMin = Math.log(minCount + 1);
                
                // 정규화된 비율 계산 (0~1 사이)
                const normalizedRatio = (logCount - logMin) / (logMax - logMin);
                
                // 크기 계산 (최소 크기에서 최대 크기까지)
                const sizeRange = fontSizeSettings.max - fontSizeSettings.min;
                const calculatedSize = fontSizeSettings.min + (normalizedRatio * sizeRange);
                
                // 최소 크기 보장
                const finalSize = Math.max(calculatedSize, fontSizeSettings.min);
                
                console.log(`단어: ${word}, 빈도: ${count}, 크기: ${Math.round(finalSize)}`);
                
                return [word, finalSize];
            });
              const options = {
                list: wordList,
                gridSize: Math.round(16 * this.canvas.width / 1024),
                weightFactor: 1,
                fontFamily: fontFamily,
                color: (word, weight, fontSize, distance, theta) => {
                    // 단어의 크기(빈도)에 따라 색상 강도 조절
                    const maxSize = Math.max(...wordList.map(([, size]) => size));
                    const minSize = Math.min(...wordList.map(([, size]) => size));
                    const normalizedIntensity = (fontSize - minSize) / (maxSize - minSize);
                    
                    const baseColors = colors;
                    const selectedColor = baseColors[Math.floor(Math.random() * baseColors.length)];
                    
                    // 빈도가 높을수록 더 진한 색상, 낮을수록 더 연한 색상
                    return this.adjustColorIntensity(selectedColor, normalizedIntensity);
                },
                backgroundColor: '#ffffff',
                rotateRatio: 0.3,
                rotationSteps: 2,
                shuffle: true,
                drawOutOfBound: false,
                shrinkToFit: true,
                minFontSize: fontSizeSettings.min,
                maxFontSize: fontSizeSettings.max
            };
            
            // 캔버스 크기 설정
            this.canvas.width = 800;
            this.canvas.height = 400;
            
            WordCloud(this.canvas, options);
            
            // 다운로드 버튼 표시
            this.downloadBtn.style.display = 'block';
            
        } catch (error) {
            console.error('워드 클라우드 생성 오류:', error);
            alert('워드 클라우드 생성 중 오류가 발생했습니다.');
            this.placeholder.style.display = 'flex';
            this.canvas.style.display = 'none';
        } finally {
            // 로딩 상태 해제
            this.generateBtn.textContent = '워드 클라우드 생성';
            this.generateBtn.disabled = false;
        }
    }
    
    // 색상 강도 조절 (빈도에 따라)
    adjustColorIntensity(hexColor, intensity) {
        // intensity: 0 (연함) ~ 1 (진함)
        
        // hex를 RGB로 변환
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // 강도에 따라 색상 조절
        // 강도가 높으면 더 진하게, 낮으면 더 연하게
        const minIntensity = 0.4; // 최소 강도 (너무 연하지 않게)
        const adjustedIntensity = minIntensity + (intensity * (1 - minIntensity));
        
        const adjustedR = Math.round(255 - (255 - r) * adjustedIntensity);
        const adjustedG = Math.round(255 - (255 - g) * adjustedIntensity);
        const adjustedB = Math.round(255 - (255 - b) * adjustedIntensity);
        
        // RGB를 hex로 변환
        const toHex = (n) => {
            const hex = n.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(adjustedR)}${toHex(adjustedG)}${toHex(adjustedB)}`;
    }

    // 이미지 다운로드
    downloadImage() {
        try {
            const link = document.createElement('a');
            link.download = 'wordcloud_' + new Date().getTime() + '.png';
            link.href = this.canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('다운로드 오류:', error);
            alert('이미지 다운로드 중 오류가 발생했습니다.');
        }
    }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    new WordCloudGenerator();
});

// 추가 유틸리티 함수들
class TextAnalyzer {
    static getWordFrequency(text) {
        const words = text.toLowerCase().match(/[가-힣a-zA-Z0-9]+/g) || [];
        const frequency = {};
        
        words.forEach(word => {
            if (word.length > 1) {
                frequency[word] = (frequency[word] || 0) + 1;
            }
        });
        
        return frequency;
    }
    
    static getTopWords(frequency, limit = 50) {
        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit);
    }
    
    static removeStopWords(words, language = 'ko') {
        const stopWords = {
            ko: ['그리고', '그런데', '하지만', '그러나', '또한', '그래서', '따라서', '즉', '예를', '들어', '같은', '다른', '이런', '저런', '어떤'],
            en: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had']
        };
        
        const stopWordSet = new Set(stopWords[language] || []);
        return words.filter(word => !stopWordSet.has(word.toLowerCase()));
    }
}

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        document.getElementById('generateBtn').click();
    }
});

// 반응형 캔버스 크기 조정
function resizeCanvas() {
    const canvas = document.getElementById('wordcloud');
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth - 40; // 패딩 고려
    const containerHeight = container.clientHeight - 40;
    
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = containerHeight + 'px';
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('DOMContentLoaded', resizeCanvas);
