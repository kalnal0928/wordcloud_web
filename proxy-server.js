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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        
        // 간단한 HTML 텍스트 추출 (서버 사이드)
        const { JSDOM } = require('jsdom');
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        // 불필요한 요소 제거
        const unwantedSelectors = ['script', 'style', 'nav', 'footer', 'aside', '.ads', '.advertisement'];
        unwantedSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });
        
        let text = document.body.textContent || '';
        text = text.replace(/\s+/g, ' ').trim();
        
        res.json({
            success: true,
            text: text,
            length: text.length,
            url: url
        });
        
    } catch (error) {
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
