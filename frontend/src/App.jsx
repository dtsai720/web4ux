import React, { useState } from 'react';
// import logo from './assets/images/logo-universal.png';
// import './App.css';
import {Login} from "../wailsjs/go/pkg/App";

function App() {
    const [currentPage, setCurrentPage] = useState('home');

    const renderHomePage = () => (
        <div id="App">
            {/* <img src={logo} id="logo" alt="logo"/> */}
            <div id="result" className="result">
                <h1>歡迎使用我的應用程式</h1>
            </div>
            <div id="input" className="input-box">
                <div className="button-container">
                    <button
                        className="btn main-btn"
                        onClick={() => setCurrentPage('fileSelect')}
                    >
                        📁 選擇檔案
                    </button>
                    <button
                        className="btn main-btn"
                        onClick={() => setCurrentPage('login')}
                    >
                        🔐 登入
                    </button>
                    <button
                        className="btn main-btn"
                        onClick={() => setCurrentPage('help')}
                    >
                        ❓ 使用說明
                    </button>
                </div>
            </div>
        </div>
    );

    const renderFileSelectPage = () => (
        <div id="App">
            {/* <img src={logo} id="logo" alt="logo"/> */}
            <div id="result" className="result">
                <h2>選擇檔案</h2>
                <p>請選擇您要上傳的檔案</p>
            </div>
            <div id="input" className="input-box">
                <div className="file-upload-area">
                    <input
                        type="file"
                        id="fileInput"
                        className="file-input"
                        multiple
                        onChange={(e) => {
                            if (e.target.files.length > 0) {
                                alert(`已選擇 ${e.target.files.length} 個檔案`);
                            }
                        }}
                    />
                    <label htmlFor="fileInput" className="btn file-btn">
                        瀏覽檔案
                    </label>
                </div>
                <div className="supported-formats">
                    <p>支援格式：PDF, DOC, DOCX, JPG, PNG, TXT</p>
                </div>
                <button
                    className="btn back-btn"
                    onClick={() => setCurrentPage('home')}
                >
                    ← 返回首頁
                </button>
            </div>
        </div>
    );

    const renderLoginPage = () => (
        <div id="App">
            {/* <img src={logo} id="logo" alt="logo"/> */}
            <div id="result" className="result">
                <h2>使用者登入</h2>
            </div>
            <div id="input" className="input-box">
                <div className="login-form">
                    <input
                        type="email"
                        className="input login-input"
                        placeholder="電子郵件"
                        autoComplete="email"
                    />
                    <input
                        type="password"
                        className="input login-input"
                        placeholder="密碼"
                        autoComplete="current-password"
                    />
                    <button
                        className="btn login-btn"
                        onClick={() => alert('登入功能尚未實作')}
                    >
                        登入
                    </button>
                </div>
                <div className="login-links">
                    <a href="#" onClick={(e) => {e.preventDefault(); alert('忘記密碼功能尚未實作');}}>
                        忘記密碼？
                    </a>
                    <span> | </span>
                    <a href="#" onClick={(e) => {e.preventDefault(); alert('註冊功能尚未實作');}}>
                        立即註冊
                    </a>
                </div>
                <button
                    className="btn back-btn"
                    onClick={() => setCurrentPage('home')}
                >
                    ← 返回首頁
                </button>
            </div>
        </div>
    );

    const renderHelpPage = () => (
        <div id="App">
            {/* <img src={logo} id="logo" alt="logo"/> */}
            <div id="result" className="result">
                <h2>使用說明</h2>
            </div>
            <div id="input" className="input-box">
                <div className="help-content">
                    <div className="help-section">
                        <h3>📁 檔案上傳</h3>
                        <p>點擊「選擇檔案」來上傳您的文件</p>
                    </div>
                    <div className="help-section">
                        <h3>🔐 使用者登入</h3>
                        <p>登入您的帳號以存取個人資料</p>
                    </div>
                    <div className="help-section">
                        <h3>❓ 常見問題</h3>
                        <p>如有問題請聯繫客服支援</p>
                    </div>
                </div>
                <button
                    className="btn back-btn"
                    onClick={() => setCurrentPage('home')}
                >
                    ← 返回首頁
                </button>
            </div>
        </div>
    );

    // 根據當前頁面狀態渲染對應的組件
    switch (currentPage) {
        case 'fileSelect':
            return renderFileSelectPage();
        case 'login':
            return renderLoginPage();
        case 'help':
            return renderHelpPage();
        default:
            return renderHomePage();
    }
}

export default App;
