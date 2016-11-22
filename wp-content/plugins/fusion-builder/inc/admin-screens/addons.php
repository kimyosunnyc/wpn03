<div class="wrap about-wrap fusion-builder-wrap">

	<?php Fusion_Builder_Admin::header(); ?>

	<div class="fusion-builder-important-notice">
		<p class="about-description">
			<?php printf( __( 'The Fusion Builder plugin has been created with extensibility as a key factor. Creating add-ons for the Builder will extend the plugins functionality and provide users with with the tools to create even more dynamic and complex content and value added services. Generating an ecosystem to extend and evolve the Fusion Builder plugin will be easier than ever before, all ready to be purchased and used from the list below. To learn more about how to get involved by creating add-ons for the Fusion Builder please check out our <a href="%1$s" target="%2$s">developer documentation</a> and email us at <a href="%3$s">info@theme-fusion.com</a> to potentially be promoted here. ', 'fusion-builder' ), 'https://theme-fusion.com/support/documentation/fusion-builder-api-documentation/', '_blank', 'mailto:info@theme-fusion.com' ); ?>
		</p>
	</div>

	<div class="avada-registration-steps">

		<div class="feature-section theme-browser rendered fusion-builder-addons">
			<?php
				$addons = array(
					'addon_1' => array(
						'title' => 'Addon 1',
						'image' => plugins_url( '/images/coming-soon.jpg', __FILE__ ),
						'ratinaImage' => plugins_url( '/images/coming-soon@2x.jpg', __FILE__ ),
						'url'	=> '#1',
					),
					'addon_2' => array(
						'title' => 'Addon 2',
						'image' => plugins_url( '/images/coming-soon.jpg', __FILE__ ),
						'ratinaImage' => plugins_url( '/images/coming-soon@2x.jpg', __FILE__ ),
						'url'	=> '#2',
					),
					'addon_3' => array(
						'title' => 'Addon 3',
						'image' => plugins_url( '/images/coming-soon.jpg', __FILE__ ),
						'ratinaImage' => plugins_url( '/images/coming-soon@2x.jpg', __FILE__ ),
						'url'	=> '#3',
					),
					'addon_4' => array(
						'title' => 'Addon 4',
						'image' => plugins_url( '/images/coming-soon.jpg', __FILE__ ),
						'ratinaImage' => plugins_url( '/images/coming-soon@2x.jpg', __FILE__ ),
						'url'	=> '#4',
					),
					'addon_5' => array(
						'title' => 'Addon 5',
						'image' => plugins_url( '/images/coming-soon.jpg', __FILE__ ),
						'ratinaImage' => plugins_url( '/images/coming-soon@2x.jpg', __FILE__ ),
						'url'	=> '#5',
					),
				);
				$n = 0;
			?>
			<?php foreach ( $addons as $id => $addon ) : ?>
				<div class="addon">
					<img class="addon-image" src="" data-src="<?php esc_attr_e( $addon['image'] ); ?>" <?php echo ( ! empty( $addon['ratinaImage'] ) ) ? 'data-src-retina="' . esc_url_raw( $addon['ratinaImage'] ) . '"' : ''; ?> />
					<noscript>
						<img src="<?php esc_attr_e( $addon['image'] ); ?>" />
					</noscript>
					<a href="<?php esc_attr_e( $addon['url'] ); ?>" target="_blank"></a>
				</div>
			<?php
				$n++;
				endforeach;
			?>
		</div>
		<script>
			jQuery( document ).ready( function() {
				var images = jQuery( '.addon-image' ),
					isRetina = window.devicePixelRatio > 1 ? true : false;
				jQuery.each( images, function( i, v ) {
					var imageSrc = ( 'undefined' !== typeof jQuery( this ).data( 'src-retina' ) && isRetina ) ? jQuery( this ).data( 'src-retina' ) : jQuery( this ).data( 'src' );
					jQuery( this ).attr( 'src', imageSrc );
				} );
			});
		</script>
	</div>
	<?php Fusion_Builder_Admin::footer(); ?>
</div>
