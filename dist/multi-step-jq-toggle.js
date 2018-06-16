(function ($) {

    "use strict";

    var $error = $('<div class="wld-error-overlay"></div>');

    function showError($field, message) {
        var field = $field[0];
        var pos = $field.offset();
        $error.css({
            top: (pos.top + $field.height()) + 'px',
            left: pos.left + 'px'
        })
        $error.text(message || field.validationMessage);
        $(document.body).append($error);
    }

    function hideError() {
        $error.remove();
    }

    function getCaptionForInput($input) {
        return getFieldForElement($input).children('.wld-field__caption');
    }

    function getFieldForElement($el) {
        return $el.closest('.wld-field');
    }

    function getFieldGroupForElement($el) {
        return $el.closest('.wld-fieldgroup');
    }

    function validateGroup($group) {
        var isValid = true;
        var inputs = getInputsForGroup($group);
        hideError();
        inputs.each(function(i, input) {
            if (isValid && !input.validity.valid) {
                input.focus();
                showError($(input));
                isValid = false;
            }
        })
        return isValid;
    }

    function getActiveInput() {
        return $(document.activeElement);
    }

    function getInputsForGroup($group) {
        return $group.find('input,select');
    }

    function MultiStepForm(el) {

        var currentStep = 0;

        function moveToNextField() {
            var $input = getActiveInput();
            var $group = getFieldGroupForElement($input);
            var $inputs = getInputsForGroup($group);
            var index = $inputs.index($input);
            if (index === $inputs.length - 1) {
                return moveToNextGroup();
            } else {
                $inputs[index + 1].focus();
                return true;
            }
        }

        function moveToPreviousField() {
            var $input = getActiveInput();
            var $group = getFieldGroupForElement($input);
            var $inputs = getInputsForGroup($group);
            var index = $inputs.index($input);
            if (index === 0) {
                return moveToPreviousGroup();
            } else {
                $inputs[index - 1].focus();
                return true;
            }
        }

        function moveToNextGroup() {
            var $currentGroup = $groups.eq(currentStep);
            var $nextGroup = $groups.eq(currentStep + 1);

            if (validateGroup($currentGroup)) {
                if ($nextGroup.length) {
                    currentStep++;
                    showGroup();
                    getInputsForGroup($nextGroup)[0].focus();
                    return true;
                } else {
                    submitForm();
                }
                return false;
            }
            return false;
        }

        function submitForm() {
            el.submit();
        }

        function moveToPreviousGroup() {
            var inputs;
            var $previousGroup = $groups.eq(currentStep - 1)
            if (currentStep > 0) {
                currentStep--;
                showGroup();
                inputs = getInputsForGroup($previousGroup);
                inputs[inputs.length - 1].focus();
                return true;
            }
            return false;
        }

        function showGroup() {
            $groups.
                removeClass('wld-fieldgroup--active').
                eq(currentStep).
                addClass('wld-fieldgroup--active');

            if (currentStep === $groups.length - 1) {
                $submit.text('Sign up');
            } else {
                $submit.text('Next');
            }
        }


        var $el = $(el);
        this.$el = $el;
        var $fields = $el.find('.wld-form__fields');
        var $submit = $el.find('.wld-form__actions button');
        var version = $el.find('input[name=version]').attr('value');

        // wrap all fields in a field-group
        $el.find('.wld-field').wrap('<div class="wld-fieldgroup"></div>');

        // move the terms / email opt-in fields
        if (version === '1.0.0' || version === '1.1.0') {
            var $termsField = getFieldForElement($('[name=consentCheck]'));
            var $genderField = getFieldForElement($('[name=gender]'));
            $termsField.insertAfter($genderField);
            var $privacyField = getFieldForElement($('[name=commsOptin]'));
            var $passwordField = getFieldForElement($('[name=password]'));
            $privacyField.insertAfter($passwordField);
        } else {
            var $termsField = getFieldForElement($('[name=consentCheck]'));
            var $passwordField = getFieldForElement($('[name=password]'));
            $termsField.insertAfter($passwordField); 
            var $privacyField = getFieldForElement($('[name=commsOptin]'));
            var $emailField = getFieldForElement($('[name=email]'));
            $privacyField.insertAfter($emailField);
        }

        // remove any empty field-groups
        $el.find('.wld-fieldgroup:empty').remove();

        var $groups = $el.find('.wld-fieldgroup');


        // Apply the label as placeholder text
        $groups.each(function(i) {
            var $inputs = getInputsForGroup($groups.eq(i));
            $inputs.each(function(j) {
                var $input = $inputs.eq(j);
                var caption = getCaptionForInput($input).text();
                if ($input.is('.wld-input--select')) {
                    var firstOption = $input[0].options[0];
                    if (firstOption.text.toLowerCase() === 'please select') {
                        firstOption.text = caption;
                    }
                } else {
                    $input.attr('placeholder', caption);
                }
            });
        });

        $('.wld-button').click($.proxy(function(e) {
            e.preventDefault();
            moveToNextGroup();
        }, this));

        $fields.keydown($.proxy(function(e) {
            if (e.keyCode === 9 || e.keyCode === 13) {
                e.preventDefault();
                if (e.shiftKey) {
                    moveToPreviousField();
                } else {
                    moveToNextField();
                }
            }
        }, this));

        $fields.on('focusin click', function(e) {
            hideError();
        });

        $(window).resize(function(e) {
            hideError();
        });

        showGroup();
    }

    $.fn.multiStepForm = function (method) {
        this.each(function (i, el) {
            var form = new MultiStepForm(el);
            form.$el.data("MultiStepForm", form);
        });
        return this;
    };

}(jQuery));
