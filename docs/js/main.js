---
layout: null
sitemap:
  exclude: 'yes'
---

$(document).ready(function () {

  $('a.blog-button').click(function (e) {
    if ($('.panel-cover').hasClass('panel-cover--collapsed')) return
    currentWidth = $('.panel-cover').width()
    if (currentWidth < 960) {
      $('.panel-cover').addClass('panel-cover--collapsed')
      $('.content-wrapper').addClass('animated slideInRight')
    } else {
      $('.panel-cover').css('max-width', currentWidth)
      $('.panel-cover').animate({'max-width': '530px', 'width': '40%'}, 400, swing = 'swing', function () {})
    }
  })

  if (window.location.hash && window.location.hash == '#blog') {
    $('.panel-cover').addClass('panel-cover--collapsed')
  }

  if (window.location.pathname !== '{{ site.baseurl }}/' && window.location.pathname !== '{{ site.baseurl }}/index.html') {
    $('.panel-cover').addClass('panel-cover--collapsed')
  }

  $('.btn-mobile-menu').click(function () {
    $('.navigation-wrapper').toggleClass('visible animated bounceInDown')
    $('.btn-mobile-menu__icon').toggleClass('icon-list icon-x-circle animated fadeIn')
  })

  $('.navigation-wrapper .blog-button').click(function () {
    $('.navigation-wrapper').toggleClass('visible')
    $('.btn-mobile-menu__icon').toggleClass('icon-list icon-x-circle animated fadeIn')
  })

  var url = "";
  $.getJSON("https://api.github.com/repos/imRish/snippeteer/releases/latest").done(function(data) {
     var assets = data.assets;

     if(assets){
        if( navigator.platform.indexOf('Mac') > -1 ) {
          url = assets.filter(asset => (asset.name).endsWith('.dmg'));
          url = url[0].browser_download_url;
        }
        else if( navigator.platform.indexOf('Win') > -1 ){
          url = assets.filter(asset => (asset.name).endsWith('.exe'));
          url = url[0].browser_download_url;
        }
        else{
          url = "https://github.com/imrish/snippeteer/releases/latest";
        }

     }       
   });

  $('#download-btn').click(function (event) { 
    if(url){
      window.open(url, '_blank');      
    }
  });

});
