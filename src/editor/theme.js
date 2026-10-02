// theme: Otomatis (ikut perangkat) / Terang / Gelap, remembered per browser
Object.assign(ICONS,{"sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>", "moon": "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>", "sun-moon": "<path d=\"M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.9 4.9 1.4 1.4\"/><path d=\"m17.7 17.7 1.4 1.4\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.3 17.7-1.4 1.4\"/><path d=\"m19.1 4.9-1.4 1.4\"/>"});
var THEME_PREF=(function(v){return v==='light'||v==='dark'?v:'auto'})(lsGet0('rancang:theme'));
var ux2Resolved0=resolvedTheme;
resolvedTheme=function(){return THEME_PREF==='auto'?ux2Resolved0():THEME_PREF};
function themeAttrSync(){var el=document.documentElement;if(THEME_PREF==='auto')return;if(el.getAttribute('data-theme')!==THEME_PREF){el.setAttribute('data-theme',THEME_PREF)}el.setAttribute('data-rt-theme',THEME_PREF)}
new MutationObserver(function(){if(THEME_PREF!=='auto'&&document.documentElement.getAttribute('data-theme')!==THEME_PREF)themeAttrSync()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
var THEME_HOST=document.documentElement.getAttribute('data-theme');
function themeIcon(){return THEME_PREF==='light'?'sun':THEME_PREF==='dark'?'moon':'sun-moon'}
function themeLabel(){return THEME_PREF==='light'?'Terang':THEME_PREF==='dark'?'Gelap':'Otomatis'}
function setThemePref(v){
  THEME_PREF=v==='light'||v==='dark'?v:'auto';lsSet('rancang:theme',THEME_PREF);
  var el=document.documentElement;if(THEME_PREF==='auto'){el.removeAttribute('data-rt-theme');if(THEME_HOST)el.setAttribute('data-theme',THEME_HOST);else el.removeAttribute('data-theme')}else themeAttrSync();
  applyTheme(true);themeBtnSync();toast('Tema: '+themeLabel()+(THEME_PREF==='auto'?' (ikut perangkat / claude.ai)':''));
}
function cycleTheme(){setThemePref(THEME_PREF==='auto'?'light':THEME_PREF==='light'?'dark':'auto')}
function themeBtnSync(){var b=$('btnTheme');if(!b)return;b.innerHTML=ic(themeIcon());b.title='Tema: '+themeLabel()+' (klik untuk ganti)';b.setAttribute('aria-label','Ganti tema, sekarang '+themeLabel())}
(function(){themeAttrSync();try{applyTheme(true)}catch(e){}
  var more=$('btnMore');if(more&&!$('btnTheme')){more.parentNode.insertAdjacentHTML('beforebegin','<button class="btn ibtn-top" id="btnTheme" type="button"></button>');$('btnTheme').onclick=cycleTheme;themeBtnSync()}})();
NV_ACTS.push(['theme-l','Tema terang','sun','theme light mode putih',function(){setThemePref('light')}],['theme-d','Tema gelap','moon','theme dark mode hitam',function(){setThemePref('dark')}],['theme-a','Tema otomatis (ikut perangkat)','sun-moon','theme auto system',function(){setThemePref('auto')}]);
