const PRISM_ASSETS = {
    day: {
        script: '/js/vendors/prism.js',
        css: '/css/prism.css'
    },
    night: {
        script: '/js/vendors/prism-dark.js',
        css: '/css/prism-dark.css'
    }
};

function resolveTheme() {
    let storedTheme = null;
    try {
        storedTheme = sessionStorage.getItem('theme');
    } catch (error) {}
    if (storedTheme === 'night' || storedTheme === 'day') {
        return storedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'night';
    }
    const hour = new Date().getHours();
    return hour < 6 || hour >= 18 ? 'night' : 'day';
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (window.Prism || document.getElementById('theme-prism-script')) {
            resolve(`脚本已加载: ${url}`);
            return;
        }
        const script = document.createElement('script');
        script.id = 'theme-prism-script';
        script.type = 'text/javascript';
        script.src = url;

        script.onload = () => resolve(`脚本加载成功: ${url}`);
        script.onerror = () => reject(`脚本加载失败: ${url}`);

        document.head.appendChild(script);
    });
}

function loadCSS(url) {
    return new Promise((resolve, reject) => {
        const previousLink = document.getElementById('theme-prism-css');
        if (previousLink && previousLink.getAttribute('href') === url) {
            resolve(`样式表已加载: ${url}`);
            return;
        }
        if (previousLink) {
            previousLink.remove();
        }

        const link = document.createElement('link');
        link.id = 'theme-prism-css';
        link.rel = 'stylesheet';
        link.href = url;

        link.onload = () => resolve(`样式表加载成功: ${url}`);
        link.onerror = () => reject(`样式表加载失败: ${url}`);

        document.head.appendChild(link);
    });
}

function loadPrismAssets(theme) {
    const assets = PRISM_ASSETS[theme] || PRISM_ASSETS.day;
    return Promise.all([
        loadScript(assets.script),
        loadCSS(assets.css)
    ]).then(messages => {
        if (window.Prism) {
            window.Prism.highlightAll();
        }
        messages.forEach(message => console.log(message));
    }).catch(error => {
        console.error(error);
    });
}

function isNight() {
    return resolveTheme() === 'night';
}

document.addEventListener('DOMContentLoaded', function() {
    const theme = resolveTheme();
    applyTheme(theme);
    loadPrismAssets(theme);
});

var ThemeSwitch = {
    init: function() {
        var switchButtons = document.getElementsByClassName('js-theme-switch');
        for (let i = 0; i < switchButtons.length; i++) {
            switchButtons[i].addEventListener('click', this.switchTheme);
        }
        var switchPopButton = document.getElementById('js-theme-switch-pop');
        if (switchPopButton) {
            switchPopButton.addEventListener('click', this.switchTheme);
        }
    },

    switchTheme: function() {
        const nextTheme = isNight() ? 'day' : 'night';
        try {
            sessionStorage.setItem('theme', nextTheme);
        } catch (error) {}
        applyTheme(nextTheme);
        if (window.updateDynamicAccentTheme) {
            window.updateDynamicAccentTheme(nextTheme);
        }
        loadPrismAssets(nextTheme);
    }
};
