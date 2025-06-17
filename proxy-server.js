// 로컬 프록시 서버 (CORS 우회용)
// Node.js와 Express를 사용한 간단한 프록시 서버

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3001;

// CORS 설정
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
    credentials: true
}));

// 정적 파일 서빙 (웹페이지 파일들)
app.use(express.static(path.join(__dirname)));

// 프록시 엔드포인트
app.use('/api/proxy', createProxyMiddleware({
    target: '',
    changeOrigin: true,
    router: (req) => {
        const targetUrl = req.query.url;
        if (!targetUrl) {
            throw new Error('URL parameter is required');
        }
        return targetUrl;
    },
    pathRewrite: {
        '^/api/proxy': ''
    },
    onError: (err, req, res) => {
        res.status(500).json({
            error: 'Proxy error',
            message: err.message
        });
    }
}));

// 텍스트 추출 API
app.get('/api/extract-text', async (req, res) => {
    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 15000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        
        // JSDOM을 사용한 HTML 파싱
        const { JSDOM } = require('jsdom');
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        // 불필요한 요소 제거
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
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            } catch (e) {
                console.log(`선택자 ${selector} 처리 중 오류:`, e);
            }
        });
        
        // 주요 콘텐츠 영역 우선 탐색
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
            const elements = document.querySelectorAll(selector);
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
            text = document.body.textContent || '';
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
            throw new Error('웹페이지에서 충분한 텍스트를 추출할 수 없습니다.');
        }
        
        console.log(`텍스트 추출 성공: ${text.length}자`);
        
        res.json({
            success: true,
            text: text,
            length: text.length,
            url: url
        });
        
    } catch (error) {
        console.error('텍스트 추출 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            url: url
        });
    }
});

app.listen(PORT, () => {
    console.log(`프록시 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log('웹페이지: http://localhost:3001');
});

module.exports = app;
