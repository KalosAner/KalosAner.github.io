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

// Code block chrome: a language label, a line-wrap toggle and a copy button,
// added to every rouge-highlighted block in a post. Markup is generated here
// rather than in the layouts so that posts render identically without JS.
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
        // Lines are separate block elements, so `.text()` would concatenate them
        // with nothing between — join them explicitly instead.
        //
        // js/hux-blog.js rewrites every code block into `.code-line` spans, so
        // that is the normal path; the `<pre>` fallback covers a block the
        // rewrite skipped.
        var $lines = $block.find(".code-line");
        var text;
        if ($lines.length) {
            var parts = [];
            $lines.each(function() { parts.push($(this).text()); });
            text = parts.join("\n");
        } else {
            var $code = $block.find("td.rouge-code pre");
            if (!$code.length) $code = $block.find("pre").last();
            text = $code.length ? $code.text() : "";
        }
        // Rouge terminates the source with a newline; that newline ends the last
        // line rather than starting another, so copying it would paste a blank
        // line. Line numbers are absolutely positioned in ::before and so are
        // never part of this text.
        return text.replace(/\n+$/, "");
    }

    // Rouge renders line numbers in a separate `<td>` of its own, so a number is
    // bound to a row only by sharing an index. That breaks as soon as one line
    // wraps: the code cell grows while the gutter cell does not, and every
    // number below the wrap drifts out of step.
    //
    // Instead, move the numbering into the code itself as CSS counters
    // (`counter-increment` on each line, `content: counter(...)` in ::before).
    // A number then lives inside the line it belongs to, so a wrapped line
    // grows its own row and stays aligned with its number.
    //
    // Highlight spans routinely straddle line breaks (`<span>"$(</span>...`),
    // so the text cannot simply be split on "\n" without shredding the markup.
    // Walk the text nodes and break only those, re-wrapping each fragment in a
    // copy of its ancestors so every line keeps its own highlighting.
    function splitLines($pre) {
        // The source `<pre>` holds the highlighted code. Work on a detached copy
        // so the DOM is never left half-converted if something throws.
        var source = $pre[0];
        var $out = $("<code class='code-lines'></code>");
        var line = null;

        function startLine() {
            line = document.createElement("span");
            line.className = "code-line";
        }

        // Clone `node`'s ancestor chain down to it, so a fragment split out of a
        // highlighted run keeps the class that colours it.
        function emit(text, chain) {
            if (!line) startLine();
            var target = line;
            for (var i = 0; i < chain.length; i++) {
                var wrapper = chain[i].cloneNode(false);
                target.appendChild(wrapper);
                target = wrapper;
            }
            target.appendChild(document.createTextNode(text));
        }

        function walk(node, chain) {
            if (node.nodeType === 3) {
                // Every newline ends the line it terminates. A blank line in the
                // source is two newlines in a row: the first ends the text line,
                // the second ends the (now empty) line that follows — which is
                // the blank line. So each "\n" closes exactly one line.
                //
                // Blank lines matter here because each one still gets a number,
                // and that is what keeps the gutter in step with the source.
                var value = node.nodeValue;
                var start = 0;
                for (var i = 0; i < value.length; i++) {
                    if (value.charAt(i) !== "\n") continue;
                    if (i > start) emit(value.slice(start, i), chain);
                    $out.append(line);
                    startLine();
                    start = i + 1;
                }
                // Text after the last newline stays on the current line; the
                // final newline of the block therefore leaves an empty trailing
                // line, which is dropped by the caller.
                if (start < value.length) emit(value.slice(start), chain);
                return;
            }
            if (node.nodeType !== 1) return;
            // An element spanning a newline has to be split across both lines,
            // so recurse with it appended to the chain rather than the line.
            var next = chain.concat([node]);
            for (var c = 0; c < node.childNodes.length; c++) {
                walk(node.childNodes[c], next);
            }
        }

        startLine();
        for (var i = 0; i < source.childNodes.length; i++) {
            walk(source.childNodes[i], []);
        }
        $out.append(line);

        // A trailing newline leaves an empty final line; drop it.
        var $last = $out.children(".code-line").last();
        if ($last.length && !$last.text().length) $last.remove();
        return $out;
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

        // Rebuild the code as per-line elements so CSS counters can number it.
        // The gutter cell is dropped: it is the reason numbers drifted out of
        // step once a line wrapped, and the counters replace it outright.
        var $codePre = $block.find("td.rouge-code pre");
        if ($codePre.length) {
            var $lines = splitLines($codePre);
            $codePre.empty().append($lines);
            $block.find("td.rouge-gutter").remove();
            // With the gutter gone the wrapper cell no longer needs to be a
            // table, but leaving the markup alone keeps the table's own styling
            // (padding, font, background) applying exactly as before.
        }

        var lang = languageOf($block);
        var $header = $("<div class='code-block-header'></div>");
        var $label = $("<span class='code-block-lang'></span>").text(lang);
        var $actions = $("<span class='code-block-actions'></span>");
        // Wrapping is off by default, matching how code blocks normally read:
        // wide lines scroll instead of reflowing.
        var $wrapWrap = $("<span class='code-switch-wrap'></span>");
        var $wrapBtn = $("<button type='button' class='code-wrap-btn' role='switch' aria-checked='false'></button>");
        var $wrapText = $("<span class='code-switch-text'>Wrap</span>");

        $wrapBtn.attr("title", "Toggle line wrapping");
        // The knob is drawn by CSS; the button carries only the track.
        $wrapBtn.append("<span class='code-switch-knob'></span>");
        $wrapBtn.on("click", function() {
            var on = $block.toggleClass("code-wrap").hasClass("code-wrap");
            $wrapBtn.toggleClass("active", on).attr("aria-checked", on ? "true" : "false");
        });
        $wrapWrap.append($wrapText).append($wrapBtn);

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

        $actions.append($wrapWrap).append($btn);
        $header.append($label).append($actions);
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