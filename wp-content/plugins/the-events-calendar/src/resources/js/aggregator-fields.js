var tribe_aggregator = tribe_aggregator || {};

// Setup the global Variable
tribe_aggregator.fields = {
	// Store the Required Selectors
	selector: {
		container               : '.tribe-ea',
		form                    : '.tribe-ea-form',
		help                    : '.tribe-ea-help',
		fields                  : '.tribe-ea-field',
		dropdown                : '.tribe-ea-dropdown',
		origin_field            : '#tribe-ea-field-origin',
		import_type_field       : '.tribe-import-type',
		media_button            : '.tribe-ea-media_button',
		datepicker              : '.tribe-datepicker',
		save_credentials_button : '.enter-credentials .tribe-save',
		preview_container       : '.tribe-preview-container',
		preview_button          : '.tribe-preview:visible',
		refine_filters          : '.tribe-refine-filters',
		clear_filters_button    : '.tribe-clear-filters',
		finalize_button         : '.tribe-finalize',
		cancel_button           : '.tribe-cancel',
		schedule_delete_link    : '.tribe-ea-tab-scheduled a.submitdelete',
		tab_new                 : '.tribe-ea-tab-new',
		action                  : '#tribe-action',
		view_filters            : '.tribe-view-filters'
	},

	media: {},

	// Store the jQuery elements
	$: {},

	// Store the methods for creating the fields
	construct: {},

	// Store the methods that will act as event handlers
	events: {},

	// store the current import_id
	import_id: null,

	// track how many result fetches have been executed via polling
	result_fetch_count: 0,

	// the maximum number of result fetches that can be done per frequency before erroring out
	max_result_fetch_count: 5,

	// frequency at which we will poll for results
	polling_frequency_index: 0,

	polling_frequencies: [
		500,
		1000,
		5000,
		20000
	],

	progress: {}
};

( function( $, _, obj, ea ) {
	'use strict';
	/**
	 * Sets up the fields for EA pages
	 *
	 * @return void
	 */
	obj.init = function() {
		obj.$.container = $( obj.selector.container );

		obj.$.form = $( obj.selector.form );

		obj.$.action = $( obj.selector.action );

		// Update what fields we currently have to setup
		obj.$.fields = obj.$.container.find( obj.selector.fields );

		// Setup the preview container
		obj.$.preview_container = $( obj.selector.preview_container );

		// Setup each type of field
		$.each( obj.construct, function( key, callback ){
			callback( obj.$.fields );
		} );

		var $tribe_events = $( document.getElementById( 'eventDetails' ) );
		if ( $tribe_events.data( 'datepicker_format' ) ) {
			tribe_ev.state.datepicker_format = $tribe_events.data( 'datepicker_format' );
		}

		$( document )
			.on( 'keypress'   , obj.selector.fields                    , obj.events.trigger_field_change )
			.on( 'click'      , obj.selector.save_credentials_button   , obj.events.trigger_save_credentials )
			.on( 'click'      , obj.selector.clear_filters_button      , obj.clear_filters )
			.on( 'click'      , obj.selector.finalize_button           , obj.finalize_manual_import )
			.on( 'click'      , obj.selector.preview_button            , obj.preview_import )
			.on( 'click'      , obj.selector.cancel_button             , obj.events.cancel_edit )
			.on( 'click'      , obj.selector.schedule_delete_link      , obj.events.verify_schedule_delete )
			.on( 'click'      , obj.selector.view_filters              , obj.events.toggle_view_filters )
			.on( 'blur'       , obj.selector.datepicker                , obj.date_helper )
			.on( 'submit'     , obj.selector.tab_new                   , obj.events.suppress_submission )
			.on( 'change'     , obj.selector.import_type_field         , function() {
				// Resets the Preview
				obj.reset_preview()

				// Every time you change Type of import we reset the frequency field
				var $this = $( this ),
				    $frequency = $( this ).next( obj.selector.fields );

				$frequency.select2( 'val', ( 'schedule' === $this.val() ? 'daily' : '' ) ).change();

				// set a data attribute on the form indicating the schedule type
				obj.$.form.attr( 'data-type', $this.val() );
			} )
			.on( 'change'     , obj.selector.origin_field              , function() {
				obj.$.form.attr( 'data-origin', $( this ).val() );
				obj.reset_preview();

				// reset all bumpdowns
				$( '.tribe-bumpdown-active' ).removeClass( 'tribe-bumpdown-active' );
				$( '.tribe-bumpdown:visible' ).hide();

				// reset all the select2 fields other than the origin
				$( '.tribe-ea-tab-new .tribe-ea-dropdown:not([id$="tribe-ea-field-origin"])' ).select2( 'val', '' ).change();

				// reset all the inputs to default values
				$( '.tribe-ea-tab-new .tribe-ea-form input' ).val( function() { return this.defaultValue; } ).change();

				if ( 'redirect' === $( this ).val() ) {
					window.open( 'https://theeventscalendar.com/wordpress-event-aggregator/?utm_source=importoptions&utm_medium=plugin-tec&utm_campaign=in-app','_blank' );
					location.reload();
				}
			} );

		$( '.tribe-dependency' ).change();

		if ( 'edit' === obj.$.action.val() ) {
			obj.$.form.addClass( 'edit-form' );
			$( obj.selector.finalize_button ).html( ea.l10n.edit_save );
		}

		if ( 'object' === typeof tribe_aggregator_save ) {
			obj.progress.init();
		}
	};

	/**
	 * Send an Ajax request to preview the import
	 */
	obj.preview_import = function() {
		obj.reset_polling_counter();

		// when generating data for previews, temporarily remove the post ID and import ID values from their fields
		var $post_id = $( '#tribe-post_id' );
		$post_id.data( 'value', $post_id.val() );
		$post_id.val( '' );

		var $import_id = $( '#tribe-import_id' );
		$import_id.data( 'value', $import_id.val() );
		$import_id.val( '' );

		var $preview = $( obj.selector.preview_button );
		var $form = $preview.closest( 'form' );
		var data = $form.serialize();

		// add the post_id value back into the field now that we've generated the serialized form data
		$post_id.val( $post_id.data( 'value' ) );
		$import_id.val( $post_id.data( 'value' ) );

		obj.$.preview_container
			.addClass( 'tribe-fetching' )
			.removeClass( 'tribe-fetch-error' );

		obj.$.form.removeClass( 'show-data' );

		$preview.prop( 'disabled', true );

		var table = $( '.dataTable' ).data( 'table' );
		if ( 'undefined' !== typeof table ) {
			table.clear().draw();
		}

		if ( 'edit' === obj.$.action.val() ) {
			// preview the import
			obj.preview_save_import( data );
		} else {
			// create the import
			obj.create_import( data );
		}
	};

	obj.reset_polling_counter = function() {
		obj.polling_frequency_index = 0;
		obj.result_fetch_count = 0;
	};

	/**
	 * Clears the refine filters
	 */
	obj.reset_form = function() {
		obj.$.fields.val( '' ).trigger( 'change' );
		$( '.tribe-ea-dropdown' ).select2( 'data', null );
		$( '[id$="import_frequency"]' ).val( 'daily' ).trigger( 'change' );
		obj.$.form.removeClass( 'show-data' );
	};

	/**
	 * Resets the preview area of a form
	 */
	obj.reset_preview = function() {
		obj.$.form.removeClass( 'show-data' );
		$( '.tribe-fetched, .tribe-fetching, .tribe-fetch-error' ).removeClass( 'tribe-fetched tribe-fetching tribe-fetch-error' );
	};

	/**
	 * Clears the refine filters
	 */
	obj.clear_filters = function() {
		$( obj.selector.refine_filters )
			.find( 'input, select' )
			.val( '' )
			.trigger( 'change' );
	};

	/**
	 * Edits an import and polls for results
	 */
	obj.preview_save_import = function( data ) {
		var jqxhr = $.ajax( {
			type: 'POST',
			url: ajaxurl + '?action=tribe_aggregator_preview_import',
			data: data,
			dataType: 'json'
		} );

		jqxhr.done( obj.handle_preview_create_results );
	};

	/**
	 * Creates an import and polls for results
	 *
	 * @param object data Form data for the import
	 */
	obj.create_import = function( data ) {
		var jqxhr = $.ajax( {
			type: 'POST',
			url: ajaxurl + '?action=tribe_aggregator_create_import',
			data: data,
			dataType: 'json'
		} );

		jqxhr.done( obj.handle_preview_create_results );
	};

	/**
	 * Handles the create/edit results
	 */
	obj.handle_preview_create_results = function( response ) {
		if ( ! response.success ) {
			obj.display_fetch_error( [
				'<b>',
					ea.l10n.preview_fetch_error_prefix,
				'</b>',
				' ' + response.data.message
			].join( ' ' ) );
			return;
		}

		// set the import id of the page
		obj.import_id = response.data.data.import_id;
		$( '#tribe-import_id' ).val( obj.import_id );

		if ( 'undefined' !== typeof response.data.data.items ) {
			obj.init_datatable( response.data.data );
			obj.$.preview_container.removeClass( 'tribe-fetching' ).addClass( 'tribe-fetched' );
			return;
		}

		obj.$.container.find( '.spinner-message' ).html( ea.l10n.preview_polling[0] );
		setTimeout( obj.poll_for_results, obj.polling_frequencies[ obj.polling_frequency_index ] );
	};

	/**
	 * Poll for results from an import
	 */
	obj.poll_for_results = function() {
		obj.result_fetch_count++;

		var jqxhr = $.ajax( {
			type: 'GET',
			url: ajaxurl + '?action=tribe_aggregator_fetch_import&import_id=' + obj.import_id,
			dataType: 'json'
		} );

		jqxhr.done( function( response ) {
			if ( ! response.success ) {
				var message;

				if ( 'undefined' !== typeof response.data.message ) {
					message = response.data.message;
				} else if ( 'undefined' !== typeof response.data[0].message ) {
					message = response.data[0].message;
				}

				obj.display_fetch_error( [
					'<b>',
						ea.l10n.preview_fetch_error_prefix,
					'</b>',
					' ' + message
				].join( ' ' ) );
				return;
			}

			if ( 'error' === response.data.status ) {
				obj.display_fetch_error( response.data.message );
			} else if ( 'success' !== response.data.status ) {
				if ( obj.result_fetch_count > obj.max_result_fetch_count ) {
					obj.polling_frequency_index++;
					obj.$.container.find( '.spinner-message' ).html( ea.l10n.preview_polling[ obj.polling_frequency_index ] );
					obj.result_fetch_count = 0;
				}

				if ( 'undefined' === typeof obj.polling_frequencies[ obj.polling_frequency_index ] ) {
					obj.display_fetch_error( ea.l10n.preview_timeout );
				} else {
					setTimeout( obj.poll_for_results, obj.polling_frequencies[ obj.polling_frequency_index ] );
				}
			} else {
				response.data.data.items = response.data.data.events;
				obj.init_datatable( response.data.data );
				obj.$.preview_container.removeClass( 'tribe-fetching' ).addClass( 'tribe-fetched' );
				$( obj.selector.preview_button ).prop( 'disabled', false );
			}
		} );
	};

	/**
	 * Initializes the datatable
	 *
	 * @param array data Array of events to display in the table
	 */
	obj.init_datatable = function( data ) {
		var display_checkboxes = false;

		var origin = $( obj.selector.origin_field ).val();
		var is_csv = 'csv' === origin;

		var $import_type = $( '[id$="import_type"]:visible' );
		var import_type = 'manual';

		// set the default settings
		if ( 'undefined' !== typeof ea.default_settings[ origin ] ) {
			for ( var settings_key in ea.default_settings[ origin ] ) {
				if ( ! ea.default_settings[ origin ].hasOwnProperty( settings_key ) ) {
					continue;
				}

				var $setting_field = $( '#tribe-ea-field-' + settings_key );

				$setting_field
					.val( ea.default_settings[ origin ][ settings_key ] )
					.select2( 'val', ea.default_settings[ origin ][ settings_key ] )
					.trigger( 'change' );
			}
		}

		if ( $import_type.length ) {
			import_type = $( '#' + $import_type.first().attr( 'id' ).replace( 's2id_', '' ) ).val();
		}

		if ( 'manual' === import_type && ! data.items.length ) {
			obj.display_fetch_error( ea.l10n.no_results );
			return;
		}

		if ( ! $import_type.length || 'manual' === import_type ) {
			display_checkboxes = true;
		}

		var $table = obj.$.preview_container.find( '.data-container table' );

		var rows = [];
		for ( var i in data.items ) {
			var row = data.items[ i ];
			row.checkbox = display_checkboxes ? '<input type="checkbox">' : '';
			if ( row.all_day ) {
				row.start_time = ea.l10n.all_day;
			} else {
				if ( 'undefined' === typeof row.start_meridian || ! row.start_meridian ) {
					if ( parseInt( row.start_hour, 10 ) > 11 ) {
						row.start_meridian = ea.l10n.pm;
					} else {
						row.start_meridian = ea.l10n.am;
					}
				}

				if ( row.start_hour > 12 ) {
					row.start_hour = row.start_hour - 12;
				}

				row.start_time = ( 0 === parseInt( row.start_hour, 10 ) ? 12 : row.start_hour ) + ':' + ( '00' + row.start_minute ).slice( -2 );
				row.start_time += ' ' + row.start_meridian;
			}
			rows.push( row );
		}

		if ( display_checkboxes && ! is_csv ) {
			$table.addClass( 'display-checkboxes' );
		} else {
			$table.removeClass( 'display-checkboxes' );
		}

		obj.$.form.addClass( 'show-data' );

		var args = {
			lengthMenu: [
				[ 5, 10, 25, 50, -1 ],
				[ 5, 10, 25, 50, tribe_l10n_datatables.pagination.all ]
			],
			order: [
				[ 1, 'asc' ]
			],
			columnDefs: [
				{
					cellType: 'th',
					className: 'check-column',
					orderable: false,
					targets: 0
				}
			],
			data: rows
		};

		if ( 'undefined' !== typeof data.columns ) {
			args.columns = [
				{ data: 'checkbox' }
			];

			var $head = $table.find( 'thead tr' );
			var $foot = $table.find( 'tfoot tr' );
			var $map_row = $({});
			var column_map = '';
			var content_type = '';
			$head.find( 'th:first' ).nextAll().remove();
			$foot.find( 'th:first' ).nextAll().remove();

			if ( is_csv ) {
				var $data_container = $table.closest( '.data-container' );
				$table.closest( '.data-container' ).addClass( 'csv-data' );

				$data_container.find( '.tribe-preview-message .tribe-csv-filename' ).html( $( '#tribe-ea-field-csv_file_name' ).text() );
				$head.closest( 'thead' ).prepend( '<tr class="tribe-column-map"><th scope="row" class="check-column column-cb"></th></tr>' );
				$map_row = $( '.tribe-column-map' );
				content_type = $( '#tribe-ea-field-csv_content_type' ).val();
				content_type = content_type.replace( 'tribe_', '' );

				var $mapper_template = $( '#tribe-csv-column-map-' + content_type );
				column_map = $mapper_template.html();
			}

			var column = 0;
			for ( i in data.columns ) {
				args.columns.push( { data: data.columns[ i ] } );
				$head.append( '<th scope="col">' + data.columns[ i ] + '</th>' );
				$foot.append( '<th scope="col">' + data.columns[ i ] + '</th>' );

				// if this is a CSV import, add the column map headers and default-select where possible
				if ( is_csv ) {
					var column_slug = data.columns[ i ].toLowerCase().replace( ' ', '_' ).replace( /[^a-z0-9_]/, '' );
					$map_row.append( '<th scope="col">' + column_map.replace( 'name="column_map[]"', 'name="aggregator[column_map][' + column + ']" id="column-' + column + '"' ) + '</th>' );

					var $map_select = $map_row.find( '#column-' + column );

					if ( 'undefined' !== typeof ea.csv_column_mapping[ content_type ][ column ] ) {
						column_slug = ea.csv_column_mapping[ content_type ][ column ];
					}

					$map_select.find( 'option[value="' + column_slug + '"]' ).prop( 'selected', true );
				}

				column++;
			}

			args.scrollX = true;
		} else {
			args.columns = [
				{ data: 'checkbox' },
				{ data: 'start_date' },
				{ data: 'start_time' },
				{ data: 'end_date' },
				{ data: 'title' }
			];
			args.autoWidth = false;
		}

		$table.tribeDataTable( args );
		obj.wrap_cell_content();

		$table
			.on( 'select.dt'  , obj.events.twiddle_finalize_button_text )
			.on( 'deselect.dt', obj.events.twiddle_finalize_button_text )
			.on( 'draw.dt', obj.wrap_cell_content );

		var text;

		if ( 'new' === obj.$.action.val() ) {
			if ( 'manual' === import_type && is_csv ) {
				text = ea.l10n.import_all_no_number;
			} else if ( 'manual' === import_type ) {
				text = ea.l10n.import_all.replace( '%d', rows.length );
			} else {
				text = ea.l10n.create_schedule;
			}
		}

		$( obj.selector.finalize_button ).html( text );
	};

	obj.wrap_cell_content = function() {
		$( '.dataTable' ).find( 'tbody td' ).each( function() {
			var $cell = $( this );
			$cell.html( '<div class="tribe-td-height-limit">' + $cell.html() + '</div>' );
		} );
	};

	/**
	 * Displays a fetch error
	 */
	obj.display_fetch_error = function( message ) {
		var $message_container = $( '.tribe-fetch-error-message' );
		obj.$.preview_container.removeClass( 'tribe-fetching' ).addClass( 'tribe-fetch-error' );

		// clear out the error message area
		$message_container.html('');

		obj.display_error( $message_container, message );
		$( obj.selector.preview_button ).prop( 'disabled', false );
	};

	/**
	 * displays an error to a container on the page
	 */
	obj.display_error = function( $container, message ) {
		$container.prepend(
			[
				'<div class="notice notice-error">',
					'<p>',
						message,
					'</p>',
				'</div>'
			].join( '' )
		);
	};

	/**
	 * displays a success message to a container on the page
	 */
	obj.display_success = function( $container, message ) {
		$container.prepend(
			[
				'<div class="notice notice-success">',
					'<p>',
						message,
					'</p>',
				'</div>'
			].join( '' )
		);
	};

	/**
	 * Saves credential form
	 */
	obj.save_credentials = function( $credentials_form ) {
		var data = $credentials_form.find( '.tribe-fieldset' ).find( 'input' ).serialize();

		var url = ajaxurl + '?action=tribe_aggregator_save_credentials';

		var jqxhr = $.post( url, data );
		jqxhr.done( function( response ) {
			if ( response.success ) {
				$credentials_form.addClass( 'credentials-entered' );
				$credentials_form.find( '[name="has-credentials"]' ).val( 1 ).change();
			}
		} );
	};

	/**
	 * Submits the final version of the import for saving events
	 */
	obj.finalize_manual_import = function() {
		var origin = $( '#tribe-ea-field-origin' ).val();
		var $table = $( '.dataTable' );
		var table = window.tribe_data_table;

		if ( 'eventbrite' === origin ) {
			obj.$.form.submit();
			return;
		}

		if ( $table.hasClass( 'display-checkboxes' ) ) {
			var row_selection = table.rows( { selected: true } );
			if ( ! row_selection[0].length ) {
				row_selection = table.rows();
			}

			if ( ! row_selection[0].length ) {
				obj.display_error( $( '.tribe-finalize-container' ), ea.l10n.events_required_for_manual_submit );
				return;
			}

			var data = row_selection.data();
			var items = [];
			var unique_id_field = null;

			if ( 'facebook' === origin ) {
				unique_id_field = 'facebook_id';
			} else if ( 'meetup' === origin ) {
				unique_id_field = 'meetup_id';
			} else if ( 'ical' === origin || 'ics' === origin || 'gcal' === origin ) {
				unique_id_field = 'uid';
			}

			if ( null !== unique_id_field ) {
				for ( var i in data ) {
					if ( isNaN( i ) ) {
						continue;
					}

					if ( 'undefined' === typeof data[ i ][ unique_id_field ] ) {
						continue;
					}

					items.push( data[ i ][ unique_id_field ] );
				}

				$( '#tribe-selected-rows' ).text( JSON.stringify( items ) );
			} else {
				$( '#tribe-selected-rows' ).text( 'all' );
			}
		} else {
			$( '#tribe-selected-rows' ).text( 'all' );
		}

		$( '.dataTables_scrollBody' ).find( '[name^="aggregator[column_map]"]' ).remove();

		obj.$.form.submit();
	};

	/**
	 * Better Search ID for Select2, compatible with WordPress ID from WP_Query
	 *
	 * @param  {object|string} e Searched object or the actual ID
	 * @return {string}   ID of the object
	 */
	obj.search_id = function ( e ) {
		var id = null;

		if ( 'undefined' !== typeof e.id ){
			id = e.id;
		} else if ( 'undefined' !== typeof e.ID ){
			id = e.ID;
		} else if ( 'undefined' !== typeof e.value ){
			id = e.value;
		}
		return e == undefined ? null : id;
	};

	/**
	 * Configure the Drop Down Fields
	 *
	 * @param  {jQuery} $fields All the fields from the page
	 *
	 * @return {jQuery}         Affected fields
	 */
	obj.construct.dropdown = function( $fields ) {
		var $elements = $fields.filter( obj.selector.dropdown ).not( '.select2-offscreen, .select2-container' );

		$elements.each(function(){
			var $select = $(this),
				args = {};

			if ( ! $select.is( 'select' ) ) {
				// Better Method for finding the ID
				args.id = obj.search_id;
			}

			// By default we allow The field to be cleared
			args.allowClear = true;
			if ( $select.is( '[data-prevent-clear]' ) ) {
				args.allowClear = false;
			}

			// If we are dealing with a Input Hidden we need to set the Data for it to work
			if ( $select.is( '[data-options]' ) ) {
				args.data = $select.data( 'options' );
			}

			// Prevents the Search box to show
			if ( $select.is( '[data-hide-search]' ) ) {
				args.minimumResultsForSearch = Infinity;
			}

			args.upsellFormatter = function( option ) {
				if ( 'redirect' == option.id ) {
					var parts = option.text.split( '|' );
					option.text = parts[0] + '<br><span class="tribe-upsell-subtitle">' + parts[1] + '</span>';
				}
				return option.text;
			}

			if ( 'tribe-ea-field-origin' === $select.attr( 'id' ) ) {
				args.formatResult = args.upsellFormatter,
    			args.formatSelection = args.upsellFormatter,
    			args.escapeMarkup = function(m) { return m; };
			}

			if ( $select.is( '[multiple]' ) ) {
				args.multiple = true;

				if ( ! _.isArray( $select.data( 'separator' ) ) ) {
					args.tokenSeparators = [ $select.data( 'separator' ) ];
				} else {
					args.tokenSeparators = $select.data( 'separator' );
				}
				args.separator = $select.data( 'separator' );

				// Define the regular Exp based on
				args.regexSeparatorElements = [ '^(' ];
				args.regexSplitElements = [ '(?:' ];
				$.each( args.tokenSeparators, function ( i, token ) {
					args.regexSeparatorElements.push( '[^' + token + ']+' );
					args.regexSplitElements.push( '[' + token + ']' );
				} );
				args.regexSeparatorElements.push( ')$' );
				args.regexSplitElements.push( ')' );

				args.regexSeparatorString = args.regexSeparatorElements.join( '' );
				args.regexSplitString = args.regexSplitElements.join( '' );

				args.regexToken = new RegExp( args.regexSeparatorString, 'ig' );
				args.regexSplit = new RegExp( args.regexSplitString, 'ig' );
			}

			/**
			 * Better way of matching results
			 *
			 * @param  {string} term Which term we are searching for
			 * @param  {string} text Search here
			 * @return {boolean}
			 */
			args.matcher = function( term, text ) {
				var result = text.toUpperCase().indexOf( term.toUpperCase() ) == 0;

				if ( ! result && 'undefined' !== typeof args.tags ){
					var possible = _.where( args.tags, { text: text } );
					if ( args.tags.length > 0  && _.isObject( possible ) ){
						var test_value = obj.search_id( possible[0] );
						result = test_value.toUpperCase().indexOf( term.toUpperCase() ) == 0;
					}
				}

				return result;
			};

			// Select also allows Tags, so we go with that too
			if ( $select.is( '[data-tags]' ) ){
				args.tags = $select.data( 'options' );

				args.initSelection = function ( element, callback ) {
					var data = [];
					$( element.val().split( args.regexSplit ) ).each( function () {
						var obj = { id: this, text: this };
						if ( args.tags.length > 0  && _.isObject( args.tags[0] ) ) {
							var _obj = _.where( args.tags, { value: this } );
							if ( _obj.length > 0 ){
								obj = _obj[0];
								obj = {
									id: obj.value,
									text: obj.text,
								};
							}
						}

						data.push( obj );

					} );
					callback( data );
				};

				args.createSearchChoice = function(term, data) {
					if ( term.match( args.regexToken ) ) {
						return { id: term, text: term };
					}
				};

				if ( 0 === args.tags.length ){
					args.formatNoMatches = function(){
						return $select.attr( 'placeholder' );
					};
				}
			}

			// When we have a source, we do an AJAX call
			if ( $select.is( '[data-source]' ) ) {
				var source = $select.data( 'source' );

				// For AJAX we reset the data
				args.data = { results: [] };

				// Allows HTML from Select2 AJAX calls
				args.escapeMarkup = function (m) {
					return m;
				};

				args.ajax = { // instead of writing the function to execute the request we use Select2's convenient helper
					dataType: 'json',
					type: 'POST',
					url: window.ajaxurl,
					results: function ( data ) { // parse the results into the format expected by Select2.
						return data.data;
					}
				};

				// By default only send the source
				args.ajax.data = function( search, page ) {
					return {
						action: 'tribe_aggregator_dropdown_' + source,
					};
				};
			}

			$select.select2( args );
		})
		.on( 'change', function( event ) {
			var $select = $(this),
				data = $( this ).data( 'value' );

			if ( ! $select.is( '[multiple]' ) ){
				return;
			}
			if ( ! $select.is( '[data-source]' ) ){
				return;
			}

			if ( event.added ){
				if ( _.isArray( data ) ) {
					data.push( event.added );
				} else {
					data = [ event.added ];
				}
			} else {
				if ( _.isArray( data ) ) {
					data = _.without( data, event.removed );
				} else {
					data = [];
				}
			}
			$select.data( 'value', data ).attr( 'data-value', JSON.stringify( data ) );
		} );

		// return to be able to chain jQuery calls
		return $elements;
	};

	/**
	 * Configures the Media Button
	 *
	 * @param  {jQuery} $fields All the fields from the page
	 *
	 * @return {jQuery}         Affected fields
	 */
	obj.construct.media_button = function( $fields ) {
		var $elements = $fields.filter( obj.selector.media_button );

		if ( typeof wp === 'undefined' || ! wp.media || ! wp.media.editor ) {
			return $elements;
		}

		$elements.each( function(){
			var $button = $( this ),
				input = $button.data( 'input' ),
				$field = $( '#' + input ),
				$name = $( '#' + input + '_name' );

			// Setup the WP Media for this slug
			var media = obj.media[ input ] = wp.media( {
				title: $button.data( 'mediaTitle' ),
				library: {
					type: $button.data( 'mimeType' )
				},
				multiple: false
			} );

			// On select send to Select2
			media.on( 'select', function (){
				var state = media.state(),
					selection = state.get('selection');

				if ( ! selection ) {
					return;
				}

				selection.each( function( attachment ) {
					$field.data( { id: attachment.attributes.id, text: attachment.attributes.title } );
					$field.val( attachment.attributes.id );
					$field.change();
					$name.html( attachment.attributes.filename );
					$name.attr( 'title', attachment.attributes.filename );
				} );
			} );

			// We don't need the Media Library button
			/*
			media.on( 'open', function () {
				$( '.media-router .media-menu-item' ).first().trigger( 'click' );
			} );
			*/
		} );

		obj.$.container.on( 'click', obj.selector.media_button, function( e ) {
			e.preventDefault();

			if ( ! $( this ).is( ':visible' ) ) {
				return;
			}

			var input = $( this ).data( 'input' );
			obj.media[ input ].open( input );
			return false;
		} );

		return $elements;
	};

	/**
	 * Triggers a change event on the given field
	 */
	obj.events.trigger_field_change = function() {
		$( this ).change();
	};

	/**
	 * Triggers the saving of credentials
	 */
	obj.events.trigger_save_credentials = function() {
		obj.save_credentials( $( this ).closest( '.enter-credentials' ) );
	};

	/**
	 * Suppress form submissions
	 */
	obj.events.suppress_submission = function( e ) {
		var origin = $( '#tribe-ea-field-origin' ).val();

		if ( $( '#tribe-selected-rows' ).val().length || 'eventbrite' === origin ) {
			return true;
		}

		e.preventDefault();
	};

	/**
	 * Adjusts the "Import" button to have contextual text based on selected records to import
	 */
	obj.events.twiddle_finalize_button_text = function( e, dt ) {
		if ( 'new' !== obj.$.action.val() ) {
			return;
		}

		var selected_rows = dt.rows({ selected: true })[0].length;
		var text = ea.l10n.import_checked;

		if ( ! selected_rows ) {
			text = ea.l10n.import_all;
			selected_rows = dt.rows()[0].length;
		}

		text = text.replace( '%d', selected_rows );
		$( obj.selector.finalize_button ).html( text );
	};

	obj.events.cancel_edit = function( e ) {
		e.preventDefault();
		var url = window.location.href;
		url = url.replace( 'tab=edit', 'tab=scheduled' );
		url = url.replace( /id=\d+/, '' );
		window.location.href = url;
	};

	obj.events.verify_schedule_delete = function() {
		return confirm( ea.l10n.verify_schedule_delete );
	};

	/**
	 * Toggles the View Filters link on the Scheduled Imports/History page
	 */
	obj.events.toggle_view_filters = function( e ) {
		e.preventDefault();
		var $el = $( this );

		$el.toggleClass( 'tribe-active' );
		if ( $el.is( '.tribe-active' ) ) {
			$el.html( ea.l10n.hide_filters );
		} else {
			$el.html( ea.l10n.view_filters );
		}
	};

	obj.progress.init = function() {
		obj.progress.data = {};
		obj.progress.$ = {};
		obj.progress.$.notice    = $( '.tribe-notice-aggregator-update-msg' );
		obj.progress.$.spinner   = obj.progress.$.notice.find( 'img' );
		obj.progress.$.progress  = obj.progress.$.notice.find( '.progress' );
		obj.progress.$.tracker   = obj.progress.$.notice.find( '.tracker' );
		obj.progress.$.created   = obj.progress.$.tracker.find( '.track-created .value' );
		obj.progress.$.updated   = obj.progress.$.tracker.find( '.track-updated .value' );
		obj.progress.$.skipped   = obj.progress.$.tracker.find( '.track-skipped .value' );
		obj.progress.$.remaining = obj.progress.$.tracker.find( '.track-remaining .value' );
		obj.progress.$.bar       = obj.progress.$.notice.find( '.bar' );
		obj.progress.data.time   = Date.now();

		setTimeout( obj.progress.start );
	};

	obj.progress.start = function() {
		obj.progress.send_request();
		obj.progress.update( tribe_aggregator_save.progress, tribe_aggregator_save.progressText );
	};

	obj.progress.handle_response = function( data ) {
		var now     = Date.now();
		var elapsed = now - obj.progress.data.time;

		if ( data.html ) {
			obj.progress.data.notice.html( data.html );
		}
		if ( data.progress ) {
			obj.progress.update( data );
		}

		if ( data.continue ) {
			// If multiple editors are open for the same event we don't want to hammer the server
			// and so a min delay of 1/2 sec is introduced between update requests
			if ( elapsed < 500 ) {
				setTimeout( obj.progress.send_request, 500 - elapsed  );
			} else {
				obj.progress.send_request();
			}
		}

		if ( data.complete ) {
			obj.progress.$.notice.find( '.tribe-message' ).html( data.complete_text );
			obj.progress.$.tracker.remove();
			obj.progress.$.notice.find( '.progress-container' ).remove();
			obj.progress.$.notice.removeClass( 'warning' ).addClass( 'completed' );
		}
	};

	obj.progress.send_request = function() {
		var payload = {
			record:  tribe_aggregator_save.record_id,
			check:  tribe_aggregator_save.check,
			action: 'tribe_aggregator_realtime_update'
		};
		$.post( ajaxurl, payload, obj.progress.handle_response, 'json' );
	};

	obj.progress.update = function( data ) {
		var percentage = parseInt( data.progress, 10 );

		// The percentage should never be out of bounds, but let's handle such a thing gracefully if it arises
		if ( percentage < 0 || percentage > 100 ) {
			return;
		}

		if ( 'undefined' === typeof data.counts ) {
			return;
		}

		var types = [ 'created', 'updated', 'skipped' ];
		for ( var i in types ) {
			if ( ! data.counts[ types[ i ] ] ) {
				continue;
			}

			obj.progress.$[ types[ i ] ].html( data.counts[ types[ i ] ] );

			if ( ! obj.progress.$.tracker.hasClass( 'has-' + types[ i ] ) ) {
				obj.progress.$.tracker.addClass( 'has-' + types[ i ] );
			}
		}

		obj.progress.$.bar.css( 'width', percentage + '%' );
		obj.progress.$.progress.attr( 'title', data.progress_text );
	};

	obj.progress.remove_notice = function() {
		var effect = {
			opacity: 0,
			height:  'toggle'
		};

		obj.progress.$.notice.animate( effect, 1000, function() {
			obj.progress.$.notice.remove();
		} );
	};

	/**
	 * helper text for date select
	 */
	obj.date_helper = function() {
		var $picker;

		$picker = $( this );

		if ( ! $picker.hasClass( 'tribe-datepicker' ) ) {
			return;
		}

		var selected_date = $picker.val();
		if ( '' === selected_date || null === selected_date ) {
			return;
		}

		var tmp = $picker.attr( 'id' ).match( 'tribe-ea-field-(.*)_start' );
		var origin = tmp[1];
		if ( '' === origin || null === origin ) {
			return;
		}

		jQuery( '#tribe-date-helper-date-' + origin ).html( selected_date );
	};

	// Run Init on Document Ready
	$( document ).ready( obj.init );
} )( jQuery, _, tribe_aggregator.fields, tribe_aggregator );
