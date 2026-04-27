let dynamicAccentHue = null;

function setDynamicAccent(hue, theme) {
  document.documentElement.style.setProperty('--primary-color', `${hue}deg`);
}

window.updateDynamicAccentTheme = function(theme) {
  if (dynamicAccentHue !== null) {
    setDynamicAccent(dynamicAccentHue, theme);
  }
};

document.addEventListener("DOMContentLoaded", function() {
  const colorThief = new ColorThief();
  const img = new Image();
  img.src = 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=en-US';
  img.crossOrigin = 'Anonymous';
  img.addEventListener('load', function() {
    const rgb = colorThief.getColor(img);
    dynamicAccentHue = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    const theme = document.documentElement.dataset.theme === 'day' ? 'day' : 'night';
    setDynamicAccent(dynamicAccentHue, theme);
  });
});

function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = (max + min) / 2;
  if (max === min) {
    h = 0; // achromatic
  } else {
    let d = max - min;
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
  }
  return 60*h;
}
