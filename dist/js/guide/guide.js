"use strict";$(function(){var t=$(".guide-nav-menu a.nav-link");$(document).scroll(function(){t.each(function(){var t=$(this).attr("href"),e=$(t).offset().top,t=e+$(t).outerHeight(),a=$(document).scrollTop();a<t-20&&e-20<=a?$(this).addClass("active"):$(this).removeClass("active")})})});