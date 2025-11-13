const dayStyles = {
    "--secondary-color": "0deg",
    "--dark-saturation": "75%",
    "--darkest-saturation": "50%",
    "--dark-lightness": "85%",
    "--darkest-lightness": "92%",
    "--gray-saturation": "76%",
    "--logo-saturation": "100%",
    "--logo-lightness": "20%",
    "--light-gray-lightness": "7%",
    "--white-lightness": "5%",
    "--background-saturation": "70%",
    "--background-lightness": "93%",
    "--middle-grey-lightness": "10%"
}

const nightStyles = {
    "--secondary-color": "0deg",
    "--dark-saturation": "25%",
    "--darkest-saturation": "30%",
    "--dark-lightness": "10%",
    "--logo-saturation": "100%",
    "--logo-lightness": "100%",
    "--darkest-lightness": "8%",
    "--gray-lightness": "76%",
    "--light-gray-lightness": "93%",
    "--white-lightness": "100%",
    "--background-saturation": "20%",
    "--background-lightness": "7%",
    "--middle-grey-lightness": "100%"
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        script.onload = () => resolve(`脚本加载成功: ${url}`);
        script.onerror = () => reject(`脚本加载失败: ${url}`);

        document.head.appendChild(script);
    });
}

function loadCSS(url) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;

        link.onload = () => resolve(`样式表加载成功: ${url}`);
        link.onerror = () => reject(`样式表加载失败: ${url}`);

        document.head.appendChild(link);
    });
}

function isNight() {
    const theme = sessionStorage.getItem("theme");
    var night = false;
    if (theme === 'night') {
        night = true;
    } else if (theme === 'day') {
        night = false;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        night = true;
    } else {
        var now = new Date();
        var hour = now.getHours();
        night = hour < 6 || hour >= 18;
    }
    console.log("night = " + night);
    return night;
};

document.addEventListener("DOMContentLoaded", function() {
    // 检测浏览器是否支持prefers-color-scheme媒体特性
    if (isNight()) {
        // night
        Object.entries(nightStyles).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
        Promise.all([
            loadScript('/js/vendors/prism-dark.js'),
            loadCSS('/css/prism-dark.css')
        ])
        .then(messages => {
            messages.forEach(message => console.log(message));
        })
        .catch(error => {
            console.error(error);
        });        
    } else {
        // day
        Object.entries(dayStyles).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
        Promise.all([
            loadScript('/js/vendors/prism.js'),
            loadCSS('/css/prism.css')
        ])
        .then(messages => {
            messages.forEach(message => console.log(message));
        })
        .catch(error => {
            console.error(error);
        });        
    }
});

var ThemeSwitch = {
    init: function() {
        var switchButtons = document.getElementsByClassName('js-theme-switch');
        for (let i = 0; i < switchButtons.length; i++) {
            switchButtons[i].addEventListener('click', this.switchTheme);
        }
        var switchPopButton = document.getElementById('js-theme-switch-pop');
        switchPopButton.addEventListener('click', this.switchTheme);
    },

    switchTheme: function() {
        if (isNight()) {
            sessionStorage.setItem("theme", "day");
        } else {
            sessionStorage.setItem("theme", "night");
        }
        location.reload();
    }
};