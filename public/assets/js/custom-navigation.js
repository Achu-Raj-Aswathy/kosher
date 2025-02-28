(function ($) {

	"use strict";

	// Cache Selectors
	var mainWindow = $(window),
		mainDocument = $(document),
		myLoader = $(".loader"),
		mytopBar = $('#top-bar'),
		mytopBar2 = $('#top-bar-2'),
		mytopBar3 = $('#top-bar-3'),
		navLink = $('.landing-page.nav a'),
		htmlBody = $('html, body');

	// Loader
	mainWindow.on('load', function () {
		myLoader.fadeOut("slow");
	});



	mainDocument.on('ready', function () {
		// Add smooth scrolling to all links
		navLink.on('click', function (event) {

			// Make sure this.hash has a value before overriding default behavior
			if (this.hash !== "") {
				// Prevent default anchor click behavior
				event.preventDefault();

				// Store hash
				var hash = this.hash;

				// Using jQuery's animate() method to add smooth page scroll
				// The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
				htmlBody.animate({
					scrollTop: $(hash).offset().top
				}, 800, function () {

					// Add hash (#) to URL when done scrolling (default click behavior)
					window.location.hash = hash;
				});
			} // End if
		});
	});





})(jQuery);





// ***************************************************
// 						NavBar
// ***************************************************



// ***********Nav Tabs Switching to work proplorly************

$(".nav-pills .nav-item .nav-link:not(.nav-pills .nav-item .nav-link), .nav-tabs").click(function () {
	$("ul.nav.nav-tabs li.nav-item.active").removeClass('active');
});


// ==================== NavBar Dropdown Fix ====================

$('.dropdown-submenu > a').on("click", function (e) {
	var submenu = $(this);
	$('.dropdown-submenu .dropdown-menu').removeClass('show');
	submenu.next('.dropdown-menu').addClass('show');
	e.stopPropagation();
});

$('.dropdown').on("hidden.bs.dropdown", function () {
	// hide any open menus when parent closes
	$('.dropdown-menu.show').removeClass('show');
});




// =================Nav Scroll================

$(window).on('scroll', function () {
	if ($(window).scrollTop()) {
		$('.navbar ul > li.nav-item').addClass('nav-padding');
	} else {
		$('.navbar ul > li.nav-item').removeClass('nav-padding');
	}
})

$(window).on('scroll', function () {
	if ($(window).scrollTop()) {
		$('.navbar.header-1').addClass('header-1-black');
	} else {
		$('.navbar.header-1').removeClass('header-1-black');
	}
})


// ================= Landing Page Active Class ================

$(document).ready(function () {
	$('.navbar.landing-page ul li').click(function () {
		$(this).addClass('active').siblings().removeClass('active')
	})
})



// ====================== Video Button =====================

$('#play-button').click(function () {
	$('#play-button').css('display', 'none');
	$('#myvideo').show();
})


// ===================Gijgo Date Picker===================


 