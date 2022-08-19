/* global wp */

jQuery(function ($) {
    function isEmailValid( email ) {
        const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const result = regex.test( String( email.toLowerCase() ) );

        return email.length > 7 && result === true
    }

    /**
     * Notice dismissal
     */
    $('button.notice-dismiss').on('click', function() {
        $.post(wpmm_vars.ajax_url, {
            action: 'wpmm_dismiss_notices',
            notice_key: this.parentElement.dataset.key,
            _wpnonce: this.parentElement.dataset.nonce
        }, function (response) {
            if (!response.success) {
                alert(response);
                return false;
            }
        })
    })

    /**
     * Migration & Rollback
     */
    $('#wpmm-migrate, #wpmm-rollback').on('click', function() {
        $.post(wpmm_vars.ajax_url, {
            action: 'wpmm_toggle_gutenberg',
            source: this.parentElement.parentElement.dataset.key,
            _wpnonce: this.parentElement.parentElement.dataset.nonce,
        }, function (response) {
            if (!response.success) {
                alert(response);
                return false;
            }

            window.location.reload();
        }, 'json');
    })

    /**
     * TABS
     */
    var hash = window.location.hash;
    if (hash !== '') {
        $('.nav-tab-wrapper').children().removeClass('nav-tab-active');
        $('.nav-tab-wrapper a[href="' + hash + '"]').addClass('nav-tab-active');

        // active tab content
        $('.tabs-content').children().addClass('hidden');
        $('.tabs-content div' + hash.replace('#', '#tab-')).removeClass('hidden');

        // trigger `show_{name}_tab_content` event (we use it to refresh codemirror instance on design tab)
        $('body').trigger('show_' + hash.replace('#', '') + '_tab_content');
    }

    $('.nav-tab-wrapper').on('click', 'a', function () {
        var tab_hash = $(this).attr('href'),
                tab_id = tab_hash.replace('#', '#tab-');

        // active tab
        $(this).parent().children().removeClass('nav-tab-active');
        $(this).addClass('nav-tab-active');

        // active tab content
        $('.tabs-content').children().addClass('hidden');
        $('.tabs-content div' + tab_id).removeClass('hidden');

        // trigger `show_{name}_tab_content` event (we use it to refresh codemirror instance on design tab)
        $('body').trigger('show_' + tab_hash.replace('#', '') + '_tab_content');
    });

    /**
     * COLOR PICKER
     */
    $('.color_picker_trigger').wpColorPicker();

    /**
     * AVAILABLE SHORTCODES
     */
    $('.shortcodes-list-wrapper').on('click', '.toggle-shortcodes-list', function (e) {
        e.preventDefault();

        var hide_text = $(this).data('hide'),
                show_text = $(this).data('show'),
                list = $(this).next('.shortcodes-list');

        list.toggleClass('show');

        var current_text = list.hasClass('show') ? hide_text : show_text;

        $(this).text(current_text);
    });

    /**
     * CHOSEN.JS MULTISELECT
     * @used for "Backend role" and "Frontend role" -> General tab
     */
    $('.chosen-select').chosen({disable_search_threshold: 10});

    /**
     * IMAGE UPLOADER
     */
    var image_uploaders = {};

    $('body').on('click', '.image_uploader_trigger', function (e) {
        e.preventDefault();

        var name = $(this).data('name') || '',
                title = $(this).data('title') || wpmm_vars.image_uploader_defaults.title,
                button_text = $(this).data('button-text') || wpmm_vars.image_uploader_defaults.button_text,
                to_selector = $(this).data('to-selector') || '';

        if (name === '' || to_selector === '') {
            alert('Required `data` attributes: name, to-selector');
            return;
        }

        // If the uploader object has already been created, reopen the dialog
        if (image_uploaders.hasOwnProperty(name)) {
            image_uploaders[name].open();
            return;
        }

        // Extend the wp.media object
        image_uploaders[name] = wp.media.frames.file_frame = wp.media({
            title: title,
            button: {
                text: button_text
            },
            multiple: false
        });

        // When a file is selected, grab the URL and set it as the text field's value
        image_uploaders[name].on('select', function () {
            var attachment = image_uploaders[name].state().get('selection').first().toJSON();
            var url = attachment.url || '';

            $(to_selector).val(url);
        });

        // Open the uploader dialog
        image_uploaders[name].open();
    });

    /**
     * SHOW DESIGN BACKGROUND TYPE BASED ON SELECTED FIELD
     */
    var show_bg_type = function (selected_val) {
        $('.design_bg_types').hide();
        $('#show_' + selected_val).show();
    };

    show_bg_type($('#design_bg_type').val());

    $('body').on('change', '#design_bg_type', function () {
        var selected_val = $(this).val();

        show_bg_type(selected_val);
    });

    /**
     * PREDEFINED BACKGROUND
     */
    $('ul.bg_list').on('click', 'li', function () {
        $(this).parent().children().removeClass('active');
        $(this).addClass('active');
    });

    /**
     * SUBSCRIBERS EXPORT
     */
    $('#subscribers_wrap').on('click', '#subscribers-export', function () {
        var nonce = $('#tab-modules #_wpnonce').val();
        $('<iframe />').attr('src', wpmm_vars.ajax_url + '?action=wpmm_subscribers_export&_wpnonce='+encodeURI( nonce )).appendTo('body').hide();
    });

    /**
     * SUBSCRIBERS EMPTY LIST
     *
     * @since 2.0.4
     */
    $('#subscribers_wrap').on('click', '#subscribers-empty-list', function () {

        var nonce = $('#tab-modules #_wpnonce').val();

        $.post(wpmm_vars.ajax_url, {
            action: 'wpmm_subscribers_empty_list',
            _wpnonce: nonce
        }, function (response) {
            if (!response.success) {
                alert(response.data);
                return false;
            }

            $('#subscribers_wrap').html(response.data);
        }, 'json');
    });

    /**
     * RESET SETTINGS
     */
    $('body').on('click', '.reset_settings', function () {
        var tab = $(this).data('tab'),
                nonce = $('#tab-' + tab + ' #_wpnonce').val();

        $.post(wpmm_vars.ajax_url, {
            action: 'wpmm_reset_settings',
            tab: tab,
            _wpnonce: nonce
        }, function (response) {
            if (!response.success) {
                alert(response.data);
                return false;
            }

            window.location.reload(true);
        }, 'json');
    });

    /**
     * COUNTDOWN TIMEPICKER
     */
    $('.countdown_start').datetimepicker({timeFormat: 'HH:mm:ss', dateFormat: 'dd-mm-yy'});

    /**
     * TEMPLATES
     */
    let pageEditURL = '#';
    $('.template-image-wrap').on('click', '.button-import', function () {
        if ( this.dataset.replace !== '0' ) {
            openModal({
                title: 'Import this template?',
                description: 'By importing this template, the existing content on your Maintenance Page will be replaced. Do you wish to continue?',
                first_button: `<button class="button button-primary button-big confirm button-import">Continue</button>`,
                second_button: `<a href="#" class="button button-secondary button-big go-back" onClick="window.location.reload()">Go back</a>`
            });

            const import_button = this;
            $('button.confirm').on('click', function () {
                $(this).html( '<span class="dashicons dashicons-update"></span>' + wpmm_vars.importing_text + '...' );
                $('.modal-content').find('.go-back').addClass('disabled');
                fire_import( import_button );
            })

        } else {
            fire_import( this );
        }
    });

    function fire_import(button) {
        const nonce = $('#tab-design #_wpnonce').val();
        const templateSlug = button.dataset.slug;
        const category = button.dataset.category;

        const data = {
            _wpnonce: nonce,
            source: 'tab-design',
            template_slug: templateSlug,
            category: category
        }

        $(button).html( '<span class="dashicons dashicons-update"></span>' + wpmm_vars.importing_text + '...' );
        $('.button-import').addClass('disabled');
        $('.button-import').css('pointer-events', 'none');
        $('.template-image-wrap').removeClass( 'can-import' );
        button.parentElement.classList.add( 'importing' );

        import_template( data, function( data ) {
            pageEditURL = data['pageEditURL'].replace(/&amp;/g, '&');

            $('.importing .button-import').html( wpmm_vars.import_done );
            openModal( {
                title: wpmm_vars.modal_texts.title,
                description: wpmm_vars.modal_texts.description,
                first_button: `<a href="${pageEditURL}" class="button button-primary button-big">${wpmm_vars.modal_texts.button_draft}</a>`,
                second_button: `<a href="#" class="button button-secondary button-big" onClick="window.location.reload()">${wpmm_vars.modal_texts.button_settings}</a>`
            } );
        } );
    }

    function openModal( content ) {
        const modal_overlay = $(
            `<div class="modal-overlay">` +
                `<div class="modal-frame">` +
                    `<div class="modal-content">` +
                        `<h4 class="modal-header">${content.title}</h4>` +
                        `<p class="modal-text">${content.description}</p>` +
                        `<div class="buttons-wrap">` +
                            content.first_button +
                            content.second_button +
                        `</div>` +
                    `</div>` +
                `</div>` +
            `</div>`
        );

        $('body').addClass('has-modal');

        if ( $('.modal-overlay').length ) {
            $('.modal-overlay').replaceWith(modal_overlay)
        } else {
            $(modal_overlay).appendTo('body');
        }
    }

    $('select[name="options[design][template_category]"]').on('change', function () {
        const nonce = $('#tab-design #_wpnonce').val();

        $.post(wpmm_vars.ajax_url, {
            action: 'wpmm_change_template_category',
            category: this.value,
            _wpnonce: nonce
        }, function (response) {
            if (!response.success) {
                alert(response);
                return false;
            }

            window.location.reload();
        }, 'json');
    });

    $('select[name="options[design][page_id]"]').on('change', function () {
        const nonce = $('#tab-design #_wpnonce').val();

        $.post(wpmm_vars.ajax_url, {
            action: 'wpmm_select_page',
            page_id: this.value,
            _wpnonce: nonce
        }, function (response) {
            if (!response.success) {
                alert(response.data);
                return false;
            }

            window.location.reload();
        }, 'json');
    });

    /**
     * WIZARD
     */
    const slider = $('.slider-wrap');

    $('h2.wpmm-title span').on('click', function() {
        window.location.href = wpmm_vars.admin_url;
    });

    if ( $('input[name="wizard-template"]:checked').val() ) {
        $('#wpmm-wizard-wrapper .button-import').removeClass('disabled');
    } else {
        $('input[name="wizard-template"]').on('change', function () {
            $('#wpmm-wizard-wrapper .button-import').removeClass('disabled');
            $('input[name="wizard-template"]').off('change');
        });
    }

    if ( $('input[name="dashboard-template"]:checked').val() ) {
        $('#dashboard-import-button .button-import').removeClass('disabled');
    } else {
        $('input[name="dashboard-template"]').on('change', function () {
            $('#dashboard-import-button .button-import').removeClass('disabled');
            $('input[name="dashboard-template"]').off('change');
        });
    }

    $('#wizard-import-button').on('click', '.button-import:not(.disabled)', function() {
        const templateSelect = $('input[name="wizard-template"]:checked')
        const templateSlug = templateSelect.val();
        const category = templateSelect[0].dataset.category;

        const data = {
            _wpnonce: wpmm_vars.wizard_nonce,
            source: 'wizard',
            template_slug: templateSlug,
            category: category
        };

        import_in_progress( data.template_slug );
        import_template( data, function (data) {
            move_to_step( 'import', 'subscribe' );
            pageEditURL = data['pageEditURL'].replace(/&amp;/g, '&');
        } );
    });

    $('#email-input-wrap input[type="text"]').on( 'keypress', (e) => {
        if (e.key === 'Enter') {
            const button = $('#email-input-wrap .subscribe-button');
            button.trigger('focus').trigger( 'click' );
        }
    })

    $('#email-input-wrap').on('click', '.subscribe-button', function(event) {
        event.preventDefault();

        const emailInput = $('#email-input-wrap input[type="text"]');
        const email = emailInput.val();

        if ( !isEmailValid( email ) ) {
            $('#email-input-wrap').append(`<p class="subscribe-message email-error"><i>${ wpmm_vars.invalid_email_string }</i></p>`);
            emailInput.addClass( 'invalid' );

            setTimeout(function() {
                $('.email-error').remove();
            }, 1500);

            return;
        }

        emailInput.removeClass( 'invalid' );

        $.post( wpmm_vars.ajax_url, {
            action: 'wpmm_subscribe',
            email: email,
            _wpnonce: wpmm_vars.wizard_nonce
        }, function (response) {
            if(!response.success) {
                alert(response.data);
            }

            move_to_step( 'subscribe', 'finish' );
        });

        return false;
    })

    $('#skip-subscribe').on('click', function() {
        move_to_step('subscribe', 'finish');
    })

    $('#view-page-button').on('click', function() {
        window.location.href = pageEditURL;
    })


    $('#refresh-button').on('click', function() {
        window.location.reload();
    })

    function import_in_progress(slug) {
        const template = $('input[value=' + slug + '] + .template');

        template.addClass( 'loading' );
        template.append( '<span class="dashicons dashicons-update"></span>' );
        template.append( '<p><i>' + wpmm_vars.loading_string + '</i></p>' );

        $('.button-import').attr( 'disabled', 'disabled' );
        $('#wpmm-wizard-wrapper .templates-radio label').css('pointer-events', 'none');
    }

    function move_to_step( prevStep, nextStep ) {
        slider.removeClass(`move-to-${prevStep}`);
        slider.addClass(`move-to-${nextStep}`);

        const prevStepElement = $(`.${prevStep}-step`);
        const nextStepElement = $(`.${nextStep}-step`);

        prevStepElement.attr('aria-hidden', 'true');
        prevStepElement.css( 'display', 'none' );

        nextStepElement.removeAttr( 'aria-hidden' );
        nextStepElement.removeAttr('style');
    }

    function import_template( data, callback ) {
        if ( !wpmm_vars.is_otter_installed ) {
            install_and_activate_otter( () => add_to_page(data, callback) );
        } else if ( !wpmm_vars.is_otter_activated ) {
            activate_otter( () => add_to_page(data, callback) );
        }
    }

    function add_to_page(data, callback) {
        data['action'] = 'wpmm_insert_template';
        $.post(wpmm_vars.ajax_url, data, function(response) {
            if (!response.success) {
                alert(response.data);
                $('.dashicons-update').remove();
                $('<p class="error import-error">' + wpmm_vars.error_string + '</p>').insertAfter('#wizard-import-button');
                return false;
            }

            callback( response.data );
        }, 'json');
    }

    function install_and_activate_otter( callback ) {
        $.post(wpmm_vars.ajax_url, {
            action: 'wp_ajax_install_plugin',
            _ajax_nonce: wpmm_vars.plugin_install_nonce,
            slug: 'otter-blocks',
        }, function(response) {
            if (!response.success) {
                alert(response.data);
                $('.dashicons-update').remove();
                $('<p class="error import-error">' + wpmm_vars.error_string + '</p>').insertAfter('#wizard-import-button');
                return false;
            }

            activate_otter( callback );
        });
    }

    function activate_otter( callback ) {
        $.get( wpmm_vars.otter_activation_link, function() {
            callback();
        } )
    }
});
