/* 
 *  [Deprecated]
 *  Plugin Name: $.fn.dropDownDiv v1.4
 *  Author: Herman Lee
 *  Date: 2010.10
 *  Description: Use div to simulate the select-option behavior. So that developer can easily to add the style on the select.
 */

$.dropDownDiv = function (container, options) {
    var defaults = {
        divWidth: 'auto',     //the width of option
        divDisplay: 'block',  //block / inline / inline-block
        imgWidth: '80%',      //the width of image which is within the div
        imgDisplay: 'block',  // - > block / inline / inline-block
        width: 220,           //the width of select
        height: '300px',      //the height of select
        highlight: 'ui-state-highlight', //the selected class
        choiceText: 'Choice One', //the select title
        selectMulti: false,       //multiple choice
        cellNum: 4, 
        method: 'POST', //ajax method
        url: '../Services/ImageHandler.ashx', //ajax url
        type: '', //ajax type
        onSuccess: false //成功時的call bacy function
    };

    var This = this;

    options = options || {};
    This.options = $.extend(defaults, options);
    var o = This.options;
    This.$container = $(container);

    if (typeof o.width == 'number') o.width += 'px';

    this.$container.css({ 'width': o.width, 'display': 'inline-block' });
    if (!this.options.selectMulti) 
        this.$container.mouseleave(function () { This._Close() });

    var $area = $('<div class="hm-dropDownArea"></div>')
                    .css({ 'overflow': 'auto', 'z-index': '10000', 'white-space': 'nowrap', 'height': o.height })
                    .addClass('ui-widget ui-widget-content')
                    .append(This.$container.children())
                    .prependTo(This.$container);

    if (!this.options.selectMulti)
        $area.hide().css({ 'position': 'absolute', 'width': o.width });


    if (This.options.url && This.options.url.length && This.options.url.length > 0) {
        var genDiv = function (i, obj) {
            if (this.Id < 0) this.Id = -i;
            if (!this.Name || typeof this.Name != 'string') this.Name = '';
            var $div = $('<div />').attr({ 'id': 'op_' + this.Id, title: this.Name, name: this.Name }).appendTo($area);

            if (this.DivHtml) $('<div class="hm-divContent" />').text(this.DivHtml).appendTo($div)
                .css({ 'white-space': 'normal', 'word-break': 'break-all', 'overflow': 'hidden', 'padding': '5px 0px' });

            if (this.ImgUrl)
                $('<div class="hm-imgContainer" />').css('height', '80%').prependTo($div)
                    .append($('<img />').attr({ 'src': this.ImgUrl, 'alt': this.Name }));
            setDiv($div, i);
        };

        var setDiv = function ($div, i) {
            if (o.selectMulti) $div.css('border-right', '1px solid #77d5f7');

            $div.addClass('hm-dropDownOption')
                .css({ width: o.divWidth, 'height': o.divHeight, display: o.divDisplay, padding: '5px',
                    cursor: 'pointer', 'vertical-align': 'bottom', 'border-bottom': '1px solid #77d5f7'
                })
                .hover(function () { $(this).addClass("ui-state-hover"); }
                     , function () { $(this).removeClass("ui-state-hover"); })
                .click(function () { This.Select(this); });

            $div.find('img').css({ width: o.imgWidth, 'height': 'auto', 'max-height': '100%' });
            if (!$div.attr('id')) $div.attr('id', 'op_' + -i);

            if (o.selectMulti && (i + 1) % o.cellNum == 0)
                $div.after('<br />');
        };

        $area.empty();

        this.options.data = this.options.data || {};
        if (this.options.type || this.options.typeId) { 
            if (this.options.type)
                this.options.data.type = this.options.type;
            if (this.options.typeId)
                this.options.data.typeId = this.options.typeId;
            this.options.method = "GET";
        }

        $.ajax({
            async: false,
            url: this.options.url,
            data: this.options.data,
            type: this.options.method,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (data) {
                if (data.d) {
                    if (data.d.data) {
                        data = data.d.data;
                    }
                    else {
                        data = data.d;
                    }
                }
                else if (data.data) {
                    data = data.data;
                }

                if (data && data.Total > 0)
                    $.each(data.Options, genDiv);
            }
        });
    }

    $('<div class="hm-dropDownSelect" ></div>')
            .prepend('<span class="hm-dropDownSelect-Text">' + this.options.choiceText + '</span>') 
            .prepend('<span style="float:left" class="ui-icon ui-icon-triangle-1-e"></span>') 
            .prependTo(this.$container) 
            .css('cursor', 'pointer') 
            .attr('selectedId', -999) 
            .addClass('ui-helper-reset ui-widget ui-state-default ui-corner-all')
            .hover(function () { $(this).addClass("ui-state-hover"); } 
                    , function () { $(this).removeClass("ui-state-hover"); })
            .bind('dbclick', function () { This.Clear(); }) 
            .click(function () { 
                if ($(this).next('.hm-dropDownArea').is(':visible'))
                    This._Close();
                else
                    This._Open();
            });

    setTimeout(function () {
        This.$container.parents('.ui-dialog-content, .ui-dialog').css('overflow', 'visible');
    }, 2500);

};
$.dropDownDiv.prototype = {
    Select: function (item) {
        $item = $(item);
        if (!this.options.selectMulti) {
            if ($item.hasClass(this.options.highlight))
                this.Clear();
            else {
                $item.addClass(this.options.highlight);
                $item.siblings('.' + this.options.highlight).removeClass(this.options.highlight);

                var name = $item.attr('name');

                $item.parent().prev('.hm-dropDownSelect').addClass(this.options.highlight)
                                   .attr('selectedId', $item.attr('id').substr(3))
                                   .children('.hm-dropDownSelect-Text')
                                   .text('[' + ((name) ? name : 'Selected') + ']');
            }
            this._Close();
        }
        else { 
            $item.toggleClass(this.options.highlight)
        }
    },
    GetValue: function () { 
        if (!this.options.selectMulti) { 
            var $select = this.$container.find('.hm-dropDownSelect');
            if ($select.is('.' + this.options.highlight)) {
                var id = $select.attr('selectedId');
                id = parseInt(id, 10);
                if (isNaN(id)) id = -999;
                return id;
            }
        }
        else {
            var Ids = []; 
            this.$container.find('.hm-dropDownArea>.hm-dropDownOption.' + this.options.highlight)
              .each(function () {
                  var id = parseInt($(this).attr('id').substr(3), 10);
                  if (!isNaN(id)) Ids.push(id);
              });
            return Ids;
        }

        return -999;
    },
    SetValue: function (id) {
        var This = this;
        var setValue = function (id) {
            var $item = This.$container.find('.hm-dropDownArea .hm-dropDownOption[id=op_' + id + ']');
            if ($item.length > 0)
                This.Select($item);
        }

        if (typeof id == 'string') {
            id = utility.parseId(id);
        }
        if (typeof id == 'number' && !isNaN(id)) {
            setValue(id); 
        }
        else if (id != undefined) {
            $.each(id, function () { 
                if (this && !isNaN(this))
                    setValue(this);
            })
        }

    },
    Clear: function () {
        var highlight = this.options.highlight;
        this.$container.find('.hm-dropDownArea').find('.' + highlight).removeClass(highlight);
        this.$container.find('.hm-dropDownSelect').removeClass(highlight)
                        .attr('selectedId', -999)
                        .find('.hm-dropDownSelect-Text').text(this.options.choiceText);
    },
    _Close: function () { 
        this.$container.find('.hm-dropDownArea').slideUp('fast');
        this.$container.find('.hm-dropDownSelect').removeClass('ui-state-active')
                          .find('.ui-icon').addClass('ui-icon-triangle-1-e').removeClass('ui-icon-triangle-1-s');
    },
    _Open: function () {
        var highligh = this.options.highlight;
        var $select = this.$container.find('.hm-dropDownSelect');
        this.$container.find('.hm-dropDownArea')
            .css({ top: $select.position().top + $select.height() }) 
            .slideDown('fast',
                    (this.options.selectMulti) ? false :
                    function () {
                        var position = $(this).children('.' + highligh).position();
                        if (position && position.top)
                            $(this).scrollTop(position.top);
                    });

        var $select = this.$container.find('.hm-dropDownSelect');
        $select.find('.ui-icon').removeClass('ui-icon-triangle-1-e').addClass('ui-icon-triangle-1-s');
        if (!this.options.selectMulti)
            $select.addClass('ui-state-active');
    },
    _Destroy: function () { 
        this.$container.empty();
        this.$container.unbind();
    }
};

$.fn.dropDownDiv = function (options, item) {
    if (options == 'get' && this.length > 0 && this[0].dropDownDiv)
        return this[0].dropDownDiv.GetValue();

    return this.each(function () {
        if (!this.dropDownDiv && options != 'destroy') {
            this.dropDownDiv = new $.dropDownDiv(this, options);
        }
        if (typeof options == 'string') {
            switch (options.toLowerCase()) {
                case 'clear':
                    this.dropDownDiv.Clear();
                    break;
                case 'set':
                    this.dropDownDiv.SetValue(item || -999);
                    break;
                case 'destroy':
                    if (this.dropDownDiv) {
                        this.dropDownDiv._Destroy();
                        this.dropDownDiv = null;
                    }
                    break;
            }
        }
    });
};
