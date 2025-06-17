// 워드 클라우드 생성기 JavaScript

class WordCloudGenerator {
    constructor() {
        this.canvas = document.getElementById('wordcloud');
        this.ctx = this.canvas.getContext('2d');
        this.textInput = document.getElementById('textInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.placeholder = document.getElementById('placeholder');
        this.colorScheme = document.getElementById('colorScheme');
        this.fontSize = document.getElementById('fontSize');
        this.fontFamily = document.getElementById('fontFamily');
        
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
        
        // 샘플 텍스트 설정
        this.textInput.value = `인공지능 머신러닝 데이터사이언스 프로그래밍 웹개발 모바일앱 클라우드컴퓨팅 사이버보안 
블록체인 빅데이터 자동화 API 데이터베이스 프론트엔드 백엔드 풀스택 개발자 소프트웨어 
알고리즘 자료구조 네트워크 서버 클라이언트 사용자경험 인터페이스 디자인 창의성 혁신 
기술 미래 디지털트랜스포메이션 스마트시티 IoT 가상현실 증강현실 로봇공학 자율주행`;
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
            small: { min: 12, max: 40 },
            medium: { min: 16, max: 60 },
            large: { min: 20, max: 80 }
        };
        return settings[size] || settings.medium;
    }
    
    // 워드 클라우드 생성
    async generateWordCloud() {
        const text = this.textInput.value.trim();
        
        if (!text) {
            alert('텍스트를 입력해주세요!');
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
                const maxCount = words[0][1];
                const normalizedSize = (count / maxCount) * fontSizeSettings.max + fontSizeSettings.min;
                return [word, normalizedSize];
            });
            
            const options = {
                list: wordList,
                gridSize: Math.round(16 * this.canvas.width / 1024),
                weightFactor: 1,
                fontFamily: fontFamily,
                color: () => {
                    return colors[Math.floor(Math.random() * colors.length)];
                },
                backgroundColor: '#ffffff',
                rotateRatio: 0.3,
                rotationSteps: 2,
                shuffle: true,
                drawOutOfBound: false,
                shrinkToFit: true
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
