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
          // 샘플 텍스트 설정 (한국어 형태소 분석 테스트용)
        this.textInput.value = `인공지능과 머신러닝은 현대 기술의 핵심입니다. 데이터사이언스를 통해 우리는 복잡한 문제들을 해결할 수 있습니다. 
프로그래밍 언어로는 파이썬이 매우 인기가 높으며, 웹개발에서는 자바스크립트가 필수적입니다. 
모바일앱 개발과 클라우드컴퓨팅 기술이 빠르게 발전하고 있습니다. 
사이버보안은 디지털 시대에 매우 중요한 분야가 되었습니다. 
블록체인 기술과 빅데이터 분석은 미래 산업의 핵심 동력이 될 것입니다. 
자동화 시스템과 API 설계는 효율적인 소프트웨어 개발에 필수적입니다. 
데이터베이스 관리와 프론트엔드 개발, 백엔드 시스템 구축은 웹 서비스의 기본 요소들입니다. 
풀스택 개발자가 되기 위해서는 다양한 기술 스택을 익혀야 합니다. 
알고리즘과 자료구조는 컴퓨터과학의 기초이며, 네트워크와 서버 관리는 시스템 운영에 중요합니다. 
사용자경험 디자인과 인터페이스 설계는 성공적인 제품을 만드는 핵심 요소입니다. 
창의성과 혁신적 사고는 기술 발전의 원동력이 됩니다. 
디지털트랜스포메이션이 진행되면서 스마트시티와 IoT 기술이 주목받고 있습니다. 
가상현실과 증강현실 기술은 새로운 경험을 제공하며, 로봇공학과 자율주행 기술은 미래를 바꿀 것입니다.`;
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
            
            // CORS 우회를 위해 여러 공개 프록시 서비스 시도
            const proxyUrls = [
                `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
                `https://cors-anywhere.herokuapp.com/${url}`,
                `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
            ];
            
            let response = null;
            let responseData = null;
            
            for (const proxyUrl of proxyUrls) {
                try {
                    response = await fetch(proxyUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json, text/plain, */*',
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        responseData = await response.json();
                        break;
                    }
                } catch (error) {
                    console.log(`프록시 ${proxyUrl} 실패:`, error);
                    continue;
                }
            }
            
            if (!responseData || !responseData.contents) {
                throw new Error('웹페이지 내용을 가져올 수 없습니다.');
            }
            
            const htmlContent = responseData.contents;
            const extractedText = this.extractTextFromHtml(htmlContent);
            
            if (!extractedText || extractedText.length < 10) {
                throw new Error('웹페이지에서 충분한 텍스트를 추출할 수 없습니다.');
            }
            
            this.extractedText.value = extractedText;
            this.showUrlStatus(`성공적으로 ${extractedText.length}자의 텍스트를 추출했습니다.`, 'success');
            
        } catch (error) {
            console.error('웹페이지 텍스트 추출 오류:', error);
            this.showUrlStatus(`오류: ${error.message}`, 'error');
            
            // 대안 방법 제안
            this.extractedText.value = '웹페이지 텍스트 추출에 실패했습니다.\n\n대안:\n1. 웹페이지의 텍스트를 직접 복사하여 "직접 입력" 탭에 붙여넣으세요.\n2. CORS 정책으로 인해 일부 웹사이트는 접근이 제한될 수 있습니다.\n3. 로컬에서 실행하는 경우 브라우저의 CORS 정책을 비활성화하거나 로컬 프록시 서버를 사용해보세요.';
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
        // 임시 DOM 요소 생성
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // 스크립트, 스타일, 주석 등 불필요한 요소 제거
        const unwantedElements = tempDiv.querySelectorAll('script, style, nav, footer, aside, .ads, .advertisement, .sidebar, .menu');
        unwantedElements.forEach(el => el.remove());
        
        // 텍스트 추출 및 정리
        let text = tempDiv.textContent || tempDiv.innerText || '';
        
        // 공백 및 특수문자 정리
        text = text.replace(/\s+/g, ' ') // 연속된 공백을 하나로
                  .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ') // 한글, 영문, 숫자, 공백만 유지
                  .trim();
        
        return text;
    }
    
    // URL 상태 메시지 표시
    showUrlStatus(message, type) {
        this.urlStatus.textContent = message;
        this.urlStatus.className = `url-status ${type}`;
    }    // 텍스트 전처리 및 단어 빈도 계산
    processText(text) {
        // 한국어 형태소 분석 적용
        const analyzedWords = this.analyzeKoreanText(text);
        
        // 단어 빈도 계산
        const wordCount = {};
        analyzedWords.forEach(word => {
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
            console.log('=== 한국어 형태소 분석 결과 ===');
            console.log(`총 고유 단어 수: ${Object.keys(wordCount).length}`);
            console.log(`최고 빈도: ${sortedWords[0][1]}회 (${sortedWords[0][0]})`);
            console.log(`최저 빈도: ${sortedWords[sortedWords.length-1][1]}회 (${sortedWords[sortedWords.length-1][0]})`);
            console.log('상위 10개 단어:', sortedWords.slice(0, 10));
            console.log('분석된 의미 단어들:', analyzedWords.slice(0, 20));
        }
        
        return sortedWords;
    }
    
    // 한국어 형태소 분석
    analyzeKoreanText(text) {
        // 한국어 불용어 리스트 (조사, 어미, 접속사 등)
        const stopWords = new Set([
            // 조사
            '이', '가', '을', '를', '에', '에서', '으로', '로', '와', '과', '의', '도', '만', '까지', '부터', '에게', '한테', '께', '에서부터', '로부터', '과함께', '와함께', '처럼', '같이', '보다', '만큼', '정도', '쯤', '라도', '나마', '이라도', '라서', '라야', '든지', '든가', '라면', '면서', '면서도', '하며', '하면서',
            // 어미
            '다', '는다', '한다', '습니다', '입니다', '이다', '입니다', '였다', '었다', '했다', '되었다', '되다', '있다', '있습니다', '없다', '없습니다', '것이다', '것입니다', '기', '게', '지', '니', '며', '거나', '든지', '라든지', '든가', '나', '네', '요', '죠',
            // 접속사 및 부사
            '그리고', '그런데', '하지만', '그러나', '또한', '그래서', '따라서', '즉', '예를', '들어', '같은', '다른', '이런', '저런', '어떤', '모든', '각각', '서로', '또', '더', '매우', '아주', '정말', '참', '꽤', '상당히', '조금', '약간', '많이', '적게', '잘', '못', '안', '않',
            // 대명사
            '이것', '그것', '저것', '여기', '거기', '저기', '이곳', '그곳', '저곳', '나', '너', '우리', '당신', '그들', '누구', '무엇', '언제', '어디', '어떻게', '왜', '어느',
            // 수사
            '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '첫째', '둘째', '셋째',
            // 기타 불용어
            '것', '수', '때', '곳', '점', '면', '등', '및', '또는', '혹은', '즉', '단', '다만', '만약', '비록', '설령', '하나', '둘', '가지', '번', '차', '개', '명', '사람', '경우', '상황', '문제', '방법', '결과', '이유', '목적', '의미', '내용', '정보', '자료', '데이터'
        ]);
        
        // 텍스트를 문장 단위로 분리
        const sentences = text.split(/[.!?。．？！]+/).filter(s => s.trim());
        const meaningfulWords = [];
        
        sentences.forEach(sentence => {
            // 기본적인 단어 분리 (공백, 특수문자 기준)
            const words = sentence.match(/[가-힣a-zA-Z0-9]+/g) || [];
            
            words.forEach(word => {
                const cleanWord = word.trim();
                if (cleanWord.length < 2) return; // 너무 짧은 단어 제외
                
                // 한국어 단어 처리
                if (/[가-힣]/.test(cleanWord)) {
                    const analyzedWord = this.analyzeKoreanWord(cleanWord);
                    if (analyzedWord && !stopWords.has(analyzedWord) && analyzedWord.length > 1) {
                        meaningfulWords.push(analyzedWord);
                    }
                } 
                // 영어 단어 처리
                else if (/[a-zA-Z]/.test(cleanWord)) {
                    const lowerWord = cleanWord.toLowerCase();
                    // 영어 불용어 체크
                    if (!this.isEnglishStopWord(lowerWord) && lowerWord.length > 2) {
                        meaningfulWords.push(lowerWord);
                    }
                }
                // 숫자가 포함된 단어 (버전, 연도 등)
                else if (/[0-9]/.test(cleanWord) && cleanWord.length > 1) {
                    meaningfulWords.push(cleanWord);
                }
            });
        });
        
        return meaningfulWords;
    }
    
    // 한국어 단어 형태소 분석 (간단한 규칙 기반)
    analyzeKoreanWord(word) {
        if (word.length < 2) return null;
        
        // 조사 제거 규칙
        const particlePatterns = [
            /이$/, /가$/, /을$/, /를$/, /에$/, /에서$/, /으로$/, /로$/, /와$/, /과$/, /의$/, /도$/, /만$/, /까지$/, /부터$/,
            /에게$/, /한테$/, /께$/, /처럼$/, /같이$/, /보다$/, /만큼$/, /라도$/, /나마$/, /라서$/, /라야$/, /라면$/
        ];
        
        // 어미 제거 규칙
        const endingPatterns = [
            /습니다$/, /입니다$/, /었습니다$/, /였습니다$/, /했습니다$/, /됩니다$/, /있습니다$/, /없습니다$/,
            /는다$/, /한다$/, /된다$/, /이다$/, /였다$/, /었다$/, /했다$/, /되었다$/, /있다$/, /없다$/,
            /하는$/, /되는$/, /있는$/, /없는$/, /하기$/, /되기$/, /하며$/, /되며$/, /하면서$/, /되면서$/,
            /하고$/, /되고$/, /하거나$/, /되거나$/, /하지만$/, /하지$/, /되지$/, /하면$/, /되면$/
        ];
        
        let cleanedWord = word;
        
        // 조사 제거
        for (const pattern of particlePatterns) {
            if (pattern.test(cleanedWord)) {
                cleanedWord = cleanedWord.replace(pattern, '');
                break;
            }
        }
        
        // 어미 제거
        for (const pattern of endingPatterns) {
            if (pattern.test(cleanedWord)) {
                cleanedWord = cleanedWord.replace(pattern, '');
                break;
            }
        }
        
        // 너무 짧아진 경우 원래 단어 반환 (단, 의미있는 경우만)
        if (cleanedWord.length < 2) {
            // 원래 단어가 명사일 가능성이 높은 경우
            if (word.length >= 3 && !this.isLikelyParticleOrEnding(word)) {
                return word;
            }
            return null;
        }
        
        return cleanedWord;
    }
    
    // 조사나 어미인지 판단하는 간단한 휴리스틱
    isLikelyParticleOrEnding(word) {
        const particleEndings = ['이다', '습니다', '입니다', '했다', '되다', '있다', '없다', '하는', '되는'];
        return particleEndings.some(ending => word.endsWith(ending));
    }
    
    // 영어 불용어 체크
    isEnglishStopWord(word) {
        const englishStopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'whose', 'if', 'else', 'while', 'because', 'as', 'until', 'although'
        ]);
        return englishStopWords.has(word.toLowerCase());
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
