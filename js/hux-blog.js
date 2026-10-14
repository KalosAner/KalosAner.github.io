/*!
 * Clean Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2015 Start Bootstrap
 * Licensed under Apache 2.0 (https://github.com/IronSummitMedia/startbootstrap/blob/gh-pages/LICENSE)
 */

 /*!
 * Hux Blog v1.6.0 (http://startbootstrap.com)
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0 
 */

// Tooltip Init
// Unuse by Hux since V1.6: Titles now display by default so there is no need for tooltip
// $(function() {
//     $("[data-toggle='tooltip']").tooltip();
// });


// make all images responsive
/* 
 * Unuse by Hux
 * actually only Portfolio-Pages can't use it and only post-img need it.
 * so I modify the _layout/post and CSS to make post-img responsive!
 */
// $(function() {
//  $("img").addClass("img-responsive");
// });

// responsive tables
$(document).ready(function() {
    $("table").wrap("<div class='table-responsive'></div>");
    $("table").addClass("table");
});

// Code block chrome: a language label and a copy button, added to every
// rouge-highlighted block in a post. Markup is generated here rather than in
// the layouts so that posts render identically without JS.
$(document).ready(function() {

    // Rouge emits `<div class="language-<lang> highlighter-rouge">`, and uses
    // `plaintext` when a fence has no language. Doubao shows nothing in that
    // case, so neither do we.
    function languageOf($block) {
        var match = /(^|\s)language-([^\s]+)/.exec($block.attr("class") || "");
        if (!match) return "";
        var lang = match[2];
        if (lang === "plaintext" || lang === "text" || lang === "highlight") return "";
        return lang;
    }

    function plainTextOf($block) {
        var $code = $block.find("td.rouge-code pre");
        if (!$code.length) $code = $block.find("pre").last();
        // Line numbers live in a sibling cell, so they are not picked up here.
        return $code.length ? $code.text() : "";
    }

    function flash($btn, label) {
        var original = $btn.data("label") || "Copy";
        $btn.addClass("copied").text(label);
        clearTimeout($btn.data("timer"));
        $btn.data("timer", setTimeout(function() {
            $btn.removeClass("copied").text(original);
        }, 1600));
    }

    // navigator.clipboard is unavailable over plain http, so keep a fallback.
    function copy(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function(resolve, reject) {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.setAttribute("readonly", "");
            ta.style.position = "fixed";
            ta.style.top = "-1000px";
            document.body.appendChild(ta);
            ta.select();
            var ok = false;
            try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
            document.body.removeChild(ta);
            ok ? resolve() : reject(new Error("copy failed"));
        });
    }

    // Rouge puts `highlighter-rouge` on inline <code> as well as on the block
    // wrapper, so select the `div` specifically.
    $("article .post-container div.highlighter-rouge").each(function() {
        var $block = $(this);
        // Idempotent: the catalog script and others also touch post markup.
        if ($block.children(".code-block-header").length) return;

        var lang = languageOf($block);
        var $header = $("<div class='code-block-header'></div>");
        var $label = $("<span class='code-block-lang'></span>").text(lang);
        var $btn = $("<button type='button' class='code-copy-btn'>Copy</button>");

        $btn.data("label", "Copy");
        $btn.on("click", function() {
            var text = plainTextOf($block);
            copy(text).then(function() {
                flash($btn, "Copied");
            }).catch(function() {
                flash($btn, "Failed");
            });
        });

        $header.append($label).append($btn);
        // The header sits outside `.highlight`, which owns the scrollbar, so it
        // stays fixed while wide code scrolls underneath.
        $block.prepend($header);
    });
});

// responsive embed videos
$(document).ready(function() {
    $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="youtube.com"]').addClass('embed-responsive-item');
    $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="vimeo.com"]').addClass('embed-responsive-item');
});

// Navigation Scripts to Show Header on Scroll-Up
jQuery(document).ready(function($) {
    var MQL = 1170;

    //primary navigation slide-in effect
    if ($(window).width() > MQL) {
        var headerHeight = $('.navbar-custom').height(),
            bannerHeight  = $('.intro-header .container').height();     
        $(window).on('scroll', {
                previousTop: 0
            },
            function() {
                var currentTop = $(window).scrollTop(),
                    $catalog = $('.side-catalog');

                //check if user is scrolling up by mouse or keyborad
                if (currentTop < this.previousTop) {
                    //if scrolling up...
                    if (currentTop > 0 && $('.navbar-custom').hasClass('is-fixed')) {
                        $('.navbar-custom').addClass('is-visible');
                    } else {
                        $('.navbar-custom').removeClass('is-visible is-fixed');
                    }
                } else {
                    //if scrolling down...
                    $('.navbar-custom').removeClass('is-visible');
                    if (currentTop > headerHeight && !$('.navbar-custom').hasClass('is-fixed')) $('.navbar-custom').addClass('is-fixed');
                }
                this.previousTop = currentTop;


                //adjust the appearance of side-catalog
                $catalog.show()
                if (currentTop > (bannerHeight + 41)) {
                    $catalog.addClass('fixed')
                } else {
                    $catalog.removeClass('fixed')
                }
            });
    }
});