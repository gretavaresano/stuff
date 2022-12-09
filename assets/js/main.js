
var hoverReady = true;
var hoverAutoReady = true;
var touch = false;

$(document).ready(function() {

    if ("ontouchstart" in document.documentElement) {
        touch = true;
    }

    $(".border").on("load", function() {
        console.log("load");
        borderPos();
    }).each(function() {
        if (this.complete) {
            $(this).trigger('load');
        }
    });



    $('.slideshow').each(function() {

        var count = $(this).attr("data-count");
        var markers = $(this).siblings(".slideshow--markers");
        var slide = $(this);

        for (var i = 0; i < count; i++) {
            markers.append("<div class='marker'></div>");
            if (i == 0) {
                markers.children().addClass("selected");
            }
        }

        slide.slick({
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            adaptiveHeight: false,
            nextArrow: slide.siblings(".slideshow--arrows").children(".arrow--next"),
            prevArrow: slide.siblings(".slideshow--arrows").children(".arrow--prev"),
            draggable: false
        });

        slide.on("beforeChange", function(event, slick, currentSlide, nextSlide) {
            markers.children().removeClass("selected");
            markers.children(".marker:eq(" + nextSlide + ")").addClass("selected");
        });

        markers.children(".marker").mousedown(function() {
            var index = markers.children().index($(this));
            slide.slick('slickGoTo', index);
        });

    });


    $("iframe").each(function() {

        var player = new Vimeo.Player(this);
        var controls = $(this).siblings(".vid--controls");
        var durationV;
        var playing = false;
        var hold = false;

        player.getDuration().then(function(duration) {
            durationV = duration;
            setInterval(function() {
                if (playing && !hold) {
                    player.getCurrentTime().then(function(seconds) {
                        var val = (seconds / durationV) * 100;
                        controls.find(".vid--progress").css({
                            "width": val + "%"
                        });
                    });
                }
            }, 30);
        });

        var dragTimeout = false;
        var setTime = 0;
        controls.children(".vid--track").mousedown(function(e) {
            if (controls.hasClass("open") || !touch) {
                var x = (e.clientX - controls.children(".vid--track").offset().left) / controls.children(".vid--track").innerWidth();
                setTime = x * durationV;
                hold = true;
            }
        });
        $("body").mouseup(function() {
            if (controls.hasClass("open") || !touch) {
                if (hold) {
                    hold = false;
                    player.setCurrentTime(setTime);
                    var val = (setTime / durationV) * 100;
                    controls.find(".vid--progress").css({
                        "width": val + "%"
                    });
                    controls.addClass("seeking");
                }
            }
        });
        $("body").mousemove(function(e) {
            if (controls.hasClass("open") || !touch) {
                if (hold && !dragTimeout) {
                    dragTimeout = true;
                    var x = (e.clientX - controls.children(".vid--track").offset().left) / controls.children(".vid--track").innerWidth();
                    if (x < 0) {
                        x = 0;
                    }
                    if (x > 1) {
                        x = 0.95;
                    }
                    setTime = x * durationV;
                    var val = (x * durationV / durationV) * 100;
                    controls.find(".vid--progress").css({
                        "width": val + "%"
                    });
                    setTimeout(function() {
                        dragTimeout = false;
                    }, 30);
                }
            }
        });

        player.on('play', function(data) {
            player.getDuration().then(function(duration) {
                durationV = duration;
            });
        });

        player.on('seeked', function(data) {
            controls.removeClass("seeking");
        });

        var vidTimeout;
        controls.mousedown(function(e) {
            if ($(e.target).closest(".vid--track").length == 0 && !touch) {
                if (playing) {
                    player.pause().then(function() {
                        controls.children(".vid--play").removeClass("hide");
                        controls.children(".vid--pause").addClass("hide");
                        playing = false;
                    });
                } else {
                    controls.children(".vid--pause").removeClass("hide");
                    controls.children(".vid--play").addClass("hide");
                    controls.addClass("vid--load");
                    player.play().then(function() {
                        controls.removeClass("vid--load");
                        playing = true;
                    });
                }
            }
            if ($(e.target).hasClass("vid--play") && touch && !playing) {
                controls.children(".vid--pause").removeClass("hide");
                controls.children(".vid--play").addClass("hide");
                controls.addClass("vid--load");
                player.play().then(function() {
                    controls.removeClass("vid--load");
                    playing = true;
                });
            }
            if ($(e.target).hasClass("vid--pause") && touch && playing && controls.hasClass("open")) {
                player.pause().then(function() {
                    controls.children(".vid--play").removeClass("hide");
                    controls.children(".vid--pause").addClass("hide");
                    playing = false;
                });
            }
            if (touch) {
                clearTimeout(vidTimeout);
                if (!controls.hasClass("open") || $(e.target).closest(".vid--track").length != 0 || $(e.target).hasClass("vid--play") || $(e.target).hasClass("vid--pause")) {
                    controls.addClass("open");
                    vidTimeout = setTimeout(function() {
                        controls.removeClass("open");
                    }, 2000);
                } else {
                    controls.removeClass("open");
                }
            }
        });
    });

    $("video").each(function() {

        this.addEventListener('loadedmetadata', function() {
            var vid = this;
            var controls = $(this).siblings(".vid--controls");
            var duration = this.duration;
            var playing = false;
            var hold = false;

            vid.pause();

            setInterval(function() {
                if (!hold) {
                    var val = (vid.currentTime / duration) * 100;
                    controls.find(".vid--progress").css({
                        "width": val + "%"
                    });
                }
            }, 30);

            var dragTimeout = false;
            var setTime = 0;
            controls.children(".vid--track").mousedown(function(e) {
                if (controls.hasClass("open") || !touch) {
                    var x = (e.clientX - controls.children(".vid--track").offset().left) / controls.children(".vid--track").innerWidth();
                    setTime = x * duration;
                    hold = true;
                }
            });
            $("body").mouseup(function() {
                if (controls.hasClass("open") || !touch) {
                    if (hold) {
                        hold = false;
                        vid.currentTime = setTime;
                        var val = (setTime / duration) * 100;
                        controls.find(".vid--progress").css({
                            "width": val + "%"
                        });
                    }
                }
            });
            $("body").mousemove(function(e) {
                if (controls.hasClass("open") || !touch) {
                    if (hold && !dragTimeout) {
                        dragTimeout = true;
                        var x = (e.clientX - controls.children(".vid--track").offset().left) / controls.children(".vid--track").innerWidth();
                        if (x < 0) {
                            x = 0;
                        }
                        if (x > 1) {
                            x = 0.95;
                        }
                        setTime = x * duration;
                        var val = (x * duration / duration) * 100;
                        controls.find(".vid--progress").css({
                            "width": val + "%"
                        });
                        setTimeout(function() {
                            dragTimeout = false;
                        }, 30);
                    }
                }
            });

            var vidTimeout;
            controls.mousedown(function(e) {
                if ($(e.target).closest(".vid--track").length == 0 && !touch) {
                    if (playing) {
                        vid.pause();
                        controls.children(".vid--play").removeClass("hide");
                        controls.children(".vid--pause").addClass("hide");
                        playing = false;
                    } else {
                        controls.children(".vid--pause").removeClass("hide");
                        controls.children(".vid--play").addClass("hide");
                        vid.play();
                        playing = true;
                    }
                }
                if ($(e.target).hasClass("vid--play") && touch && !playing) {
                    controls.children(".vid--pause").removeClass("hide");
                    controls.children(".vid--play").addClass("hide");
                    vid.play();
                    playing = true;
                }
                if ($(e.target).hasClass("vid--pause") && touch && playing && controls.hasClass("open")) {
                    vid.pause();
                    controls.children(".vid--play").removeClass("hide");
                    controls.children(".vid--pause").addClass("hide");
                    playing = false;
                }
                if (touch) {
                    clearTimeout(vidTimeout);
                    if (!controls.hasClass("open") || $(e.target).closest(".vid--track").length != 0 || $(e.target).hasClass("vid--play") || $(e.target).hasClass("vid--pause")) {
                        controls.addClass("open");
                        vidTimeout = setTimeout(function() {
                            controls.removeClass("open");
                        }, 2000);
                    } else {
                        controls.removeClass("open");
                    }
                }
            });
        });

    });


    $(document).mousemove(function(e) {
        $("#follow").css({
          left: e.pageX,
          top: e.pageY
        });
      });
});
