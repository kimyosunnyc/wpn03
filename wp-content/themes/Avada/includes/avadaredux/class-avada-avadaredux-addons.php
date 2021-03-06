<?php

// Do not allow directly accessing this file.
if ( ! defined( 'ABSPATH' ) ) {
	exit( 'Direct script access denied.' );
}

if ( class_exists( 'Avada_AvadaRedux_Addons' ) ) {
	return;
}

/**
 * Handle loading Redux Addons for Avada.
 *
 * @since 4.0.0
 */
class Avada_AvadaRedux_Addons {

	/**
	 * An array of our custom field types.
	 *
	 * @access public
	 * @var array
	 */
	public $field_types;

	/**
	 * An array of our custom extension.
	 *
	 * @access public
	 * @var array
	 */
	public $extensions;

	/**
	 * The path of the current file.
	 *
	 * @access public
	 * @var string
	 */
	public $path;

	/**
	 * Constructor.
	 *
	 * @access public
	 */
	public function __construct() {
		// An array of all the custom fields we have.
		$this->field_types = array(
			'typography',
			'color_alpha',
			'spacing',
			'dimensions',
			'ace_editor',
		);
		// An array of all our extensions.
		$this->extensions = array(
			'search',
			'repeater',
			'accordion',
			'vendorsupport',
		);

		$this->path = dirname( __FILE__ );

		foreach ( $this->field_types as $field_type ) {
			add_action( 'avadaredux/' . Avada::get_option_name() . '/field/class/' . $field_type, array( $this, 'register_' . $field_type ) );
		}

		foreach ( $this->extensions as $extension ) {
			if ( class_exists( 'AvadaRedux' ) ) {
				AvadaRedux::setExtensions( Avada::get_option_name(), $this->path . '/extensions/' . $extension . '/extension_' . $extension . '.php' );
			}
		}
	}

	/**
	 * Register the custom typography field
	 */
	public function register_typography() {
		return $this->path . '/custom-fields/typography/field_typography.php';
	}


	/**
	 * Register the custom ace_editor field
	 */
	public function register_ace_editor() {
		return $this->path . '/custom-fields/ace_editor/field_ace_editor.php';
	}

	/**
	 * Register the custom color_alpha field
	 */
	public function register_color_alpha() {
		return $this->path . '/custom-fields/color_alpha/field_color_alpha.php';
	}

	/**
	 * Register the custom spacing field
	 */
	public function register_spacing() {
		return $this->path . '/custom-fields/spacing/field_spacing.php';
	}

	/**
	 * Register the custom dimensions field
	 */
	public function register_dimensions() {
		return $this->path . '/custom-fields/dimensions/field_dimensions.php';
	}
}
