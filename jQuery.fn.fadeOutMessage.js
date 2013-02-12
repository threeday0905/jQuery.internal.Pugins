$.fadeoutMessage = function (target, options) {
    if (target.msg) return false;
    $(target).addClass("ui-state-highlight ui-corner-all").hide();
    options = $.extend({
        msgType: 'info',
        message: ''
    }, options);

    var msg = {
        setP: function (msgType, message) {
            if (message == null) return;
            $(this.p).empty();
            var iconClass = '';
            if (msgType == 'alert')
                iconClass = 'ui-icon-alert';
            else
                iconClass = 'ui-icon-info';

            $(this.p).css({ "font-size": "12px" })
                    .append('<span class="ui-icon ' + iconClass +
                            '" style="float: left; margin-right: .3em;"></span>&nbsp;' + message);
        }
    };

    msg.p = document.createElement('p');
    msg.setP(options.msgType, options.message);
    target.msg = msg;
    target.options = options;
    return target;
};

$.fn.fadeoutMessage = function (options, data) {
    options = options || {};

    return this.each(function () {
        if (!this.msg) {
            $.fadeoutMessage(this, options);
        }
        if (typeof options == 'string') {
            switch (options.toLowerCase()) {
                case 'show':
                    if (data != undefined) {
                        this.msg.setP('alert', data);
                        $(this).append(this.msg.p);
                        $(this).fadeIn(1000, function () { $(this).delay(1000).fadeOut(1000); });
                    }
                    break;
            }
        }
    });
};
