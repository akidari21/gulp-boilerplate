
$(function() {
  // scrollsply for UI-Guide
  var sectionIds = $(".guide-nav-menu a.nav-link");
  $(document).scroll(function () {
    sectionIds.each(function () {
      var container = $(this).attr("href");
      var containerOffset = $(container).offset().top;
      var containerHeight = $(container).outerHeight();
      var containerBottom = containerOffset + containerHeight;
      var scrollPosition = $(document).scrollTop();

      if (scrollPosition < containerBottom - 20 && scrollPosition >= containerOffset - 20) {
        $(this).addClass("active");
      } else {
        $(this).removeClass("active");
      }
    });
  });
});