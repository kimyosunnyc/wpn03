<?php

// Do not allow directly accessing this file.
if ( ! defined( 'ABSPATH' ) ) {
	exit( 'Direct script access denied.' );
}
?>

<div id="slidingbar-area" class="slidingbar-area fusion-widget-area<?php echo ( Avada()->settings->get( 'slidingbar_open_on_load' ) ) ? ' open_onload' : ''; ?>">
	<div class="sb-toggle-wrapper">
		<ul id="main_toggle" class="sb-toggle-btn">
			<li><a href="http://113366.com/ksystem" target="_blank"><img src="/wp-content/uploads/2017/01/main_tab_01.png" alt="원격지원"></a></li>
			<li><a class="sb-toggle" href="#"><img src="/wp-content/uploads/2017/01/main_tab_02.png" alt="공지사항"></a></li>
			<li><a href="/mobile/"><img src="/wp-content/uploads/2017/01/main_tab_03.png" alt="모바일ERP"></a></li>
			<li><a href="/클라우드-erp-2/"><img src="/wp-content/uploads/2017/01/main_tab_04.png" alt="클라우드서비스"></a></li>
		</ul>
	</div>
	<div id="main_sb_01">
		<div class="remove_btn"><a class="sb-toggle" href="#"><i class="icon-remove"></i></a></div>
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
</div>
<?php wp_reset_postdata();

/* Omit closing PHP tag to avoid "Headers already sent" issues. */
