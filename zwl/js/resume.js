	// 监听滚动
    $('#navbar-example').on('activate.bs.scrollspy', function () {
            var pre = $("#navbar-example li.active > a").text();
            PageAniamtion(pre);//页面过场动画
    });
    // 第一次出现以动画载入
	$('#page1 p').hide();
	$('#page2 h3').hide();
	$('#page2 p').hide();
	$('#page3 h3').hide();
	$('#page3 .exper-box').hide();
	$('#page4 h3').hide();
	$('#page4 article').hide();
 	function PageAniamtion(liText) {
        switch (liText) {
            case 'About':
            {
                $('#page1 p').show();
                break;
            }
            case 'Skill':
            {
                $('#page2 h3').show();
                $('#page2 p').show();
                break;
            }
            case 'Experience':
            {
                $('#page3 h3').show();
                $('#page3 .exper-box').show();
                break;
            }            
            case 'Contact':
            {
                $('#page4 h3').show();
                $('#page4 article').show();
                break;
            }
            default :
            {
                break;
            }
        }
    }