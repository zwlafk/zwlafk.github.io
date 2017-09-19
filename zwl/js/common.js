 // loading动画
    window.onload=function(){
        $(".FullScreen").fadeOut();
    }
    // 回顶部
    window.onscroll=function () { 
            if ($(window).scrollTop() != 0){
        
                $(".totop").fadeIn(); 
            } if($(window).scrollTop() == 0){
                $(".totop").fadeOut(); 
            }
        }
    $(".totop").on("click",toTop);
        function toTop() {
        var     dd = document.documentElement,
                db = document.body,
                top = dd.scrollTop || db.scrollTop,
                step = Math.floor(top / 20);
            (function() {
                top -= step;
                if (top > -step) {
                    dd.scrollTop == 0 ? db.scrollTop = top: dd.scrollTop = top;
                    setTimeout(arguments.callee, 20);
                }
            })();
        }