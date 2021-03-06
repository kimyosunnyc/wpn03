<?php

// Do not allow directly accessing this file.
if ( ! defined( 'ABSPATH' ) ) {
	exit( 'Direct script access denied.' );
}
?>

<script>

$(document).ready(function(){
//alert($('#slidingbar').css('display'));
//alert(getCookie("notToday"));
	if($('#slidingbar').css('display') == "none"){
		// Open SideNav
		$(".open-toggle").click(function () {
			$("#slidingbar").css("display","block");
		});
	} else {
		// Close SideNav
		$(".close-toggle").click(function () {
			$("#slidingbar").css("display","none");
		});
	}
	if(getCookie("notToday") == "done"){
		$(document).ready(function(){
			$("#slidingbar").css("display","none");
		});
	}else{
		$(document).ready(function(){
			$("#slidingbar").css("display","block");
		});
	}

	function closePopupNotToday(){	             
		setCookie('notToday','done', 1);
		$("#slidingbar").css("display","none");
	}	
});
	function setCookie(name, value, expiredays) {
		var today = new Date();
		today.setDate(today.getDate() + expiredays);
		document.cookie = name + '=' + escape(value) + '; path=/; expires=' + today.toGMTString() + ';'
	}

	function getCookie(name) { 
		var cName = name + "="; 
		var x = 0; 
		while ( x <= document.cookie.length ){ 
			var y = (x+cName.length); 
			if ( document.cookie.substring( x, y ) == cName ) { 
				if ( (endOfCookie=document.cookie.indexOf( ";", y )) == -1 ) 
				endOfCookie = document.cookie.length;
				return unescape( document.cookie.substring( y, endOfCookie ) ); 
			} 
			x = document.cookie.indexOf( " ", x ) + 1; 
			if ( x == 0 ) 
				break; 
		}
		return ""; 
	}

	function closeLayer(){ // 오늘하루보기가 체크 유무에 따른 쿠키 설정
		if (document.form1.popup.checked){setCookie("notToday", "done" ,1);}          
		jQuery("#slidingbar").hide(); 
	}
</script>

<div id="slidingbar-area" class="slidingbar-area fusion-widget-area<?php echo ( Avada()->settings->get( 'slidingbar_open_on_load' ) ) ? ' open_onload' : ''; ?>">
	<div id="slidingbar">
		<div class="remove_btn" style="margin-bottom:20px;">
			<form name="form1" method="post" action="">
				<input type="checkbox" name="popup" title="오늘 다시 보지 않기" />오늘 다시 보지 않기&nbsp;&nbsp;
				<a class="close-toggle" href="javascript:closeLayer();"><i class="icon-remove"></i></a>
			</form>
		</div>
		<div class="fusion-row">
			<div class="fusion-columns row fusion-columns-<?php echo Avada()->settings->get( 'slidingbar_widgets_columns' ); ?> columns columns-<?php echo Avada()->settings->get( 'slidingbar_widgets_columns' ); ?>">
				<?php $column_width = ( Avada()->settings->get( 'slidingbar_widgets_columns' ) == '5' ) ? 2 : 12 / Avada()->settings->get( 'slidingbar_widgets_columns' ); ?>
				<?php
				/**
				 * Render as many widget columns as have been chosen in Theme Options.
				 */
				?>
			<?php for ( $i = 1; $i < 7; $i++ ) : ?>
					<?php if ( $i <= Avada()->settings->get( 'slidingbar_widgets_columns' ) ) : ?>
						<div class="fusion-column <?php echo ( Avada()->settings->get( 'slidingbar_widgets_columns' ) == $i ) ? 'fusion-column-last' : ''; ?>col-lg-<?php echo $column_width; ?> col-md-<?php echo $column_width; ?> col-sm-<?php echo $column_width; ?>">
						<?php if ( function_exists( 'dynamic_sidebar' ) && dynamic_sidebar( 'avada-slidingbar-widget-' . $i ) ) : ?>
							<?php // All is good, dynamic_sidebar() already called the rendering. ?>
						<?php endif; ?>
						</div>
					<?php endif; ?>
				<?php endfor; ?>
				<div class="fusion-clearfix"></div>
			</div>
		</div>
	</div>
	<div class="sb-toggle-wrapper">
		<ul id="main_toggle" class="sb-toggle-btn">
			<li><a href="http://113366.com/ksystem" target="_blank"><img src="/wp-content/uploads/2017/01/main_tab_01.png" alt="원격지원"></a></li>
			<li><a class="open-toggle" href="#"><img src="/wp-content/uploads/2017/01/main_tab_02.png" alt="공지사항"></a></li>
			<li><a href="/k-system-mobile/"><img src="/wp-content/uploads/2017/01/main_tab_03.png" alt="모바일ERP"></a></li>
			<li><a href="/클라우드서비스erp/"><img src="/wp-content/uploads/2017/01/main_tab_04.png" alt="클라우드서비스"></a></li>
		</ul>
	</div>	
</div>
<?php wp_reset_postdata();

/* Omit closing PHP tag to avoid "Headers already sent" issues. */