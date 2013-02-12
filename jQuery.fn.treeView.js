$.treeView = function (container, options) {
    var defaults = {
        showTitle: true, 
        title: '', 
        uiTitle: false,
        uiTitleIcon: false,
        triggerBtnWidth: '20px',
        height: '400px', 
        width: 'auto', 
        moveText: 'Move Mode', 
        saveOrder: false, 
        defaultBtn: true, // default buttons: move / reload / refresh / etc..
        keybordAble: true, // use keyboard to move the tree item
        icon: { level1: 'level1', level2: 'level2', level3: 'level3', level4: 'level4', level5: 'level5' }, // icon class
        showMsg: true, 
        onPreRender: false, //call back function: triggered on pre render
        onError: false,     //call back function: treggered on error
        buttons: false, 
        maintainMode: true, 
        moveMode: true,     // could the tree item be moved.  
        onClick: false,     //call back function: triggered on click
        appendContainer: false 
    };

    if (!options || typeof options == 'string')
        options = {};

    var _this = this;
    var o = $.extend(defaults, options);

    _this.options = o;

    _this.$container = $(container);

    _this.loadData = function (reloadId) {

        if (o.url && o.url.length && o.url.length > 0) {
            _this.$container.empty();
            o.data = o.data || {};

            $.ajax({
                url: this.options.url,
                data: this.options.data,
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (data) {
                    if (!data || !data.d || !data.d.data || !data.d.data.Nodes || data.d.data.Nodes.length == 0) return;

                    var html = '';
                    var genTree = function (nodes) {
                        if (nodes && nodes.length > 0) {
                            html += '<ul>';
                            for (var i = 0; i < nodes.length; i++) {
                                var node = nodes[i];
                                node.Display = node.Display || node.Name;
                                html = html.concat(
                                    '<li id="tn-' + (node.Id || -999) + '" rel="' + (node.Type || '') + '" order="' + (node.Order || 0)
                                         + '"name="' + (node.Name || '') + '" title="' + (node.Name || '') + '">',
                                    '<div class="hm-tree-item">',
                                    (node.Type) ? // && o.icon && o.icon[node.Type]) ?
                                        '<span class="hm-tree-icon ' + node.Type + '">&nbsp;</span>' : '',
                                    '<span class="hm-tree-item-name">' + (node.Display || '') + '</span>' + (node.Content || '') + '</div>',
                                    (node.Right) ? ('<div style="float:right">' + node.Right + '</div>') : ''
                                    );
                                if (node.Nodes && node.Nodes.length > 0)
                                    genTree(node.Nodes);
                                html = html.concat('</li>');
                            }
                            html = html.concat('</ul>');
                        }
                    };

                    genTree(data.d.data.Nodes);   
                    _this.$container.html(html); 

                    var $listItems = _this.$container.find('li').prepend('<span class="hm-tree-trigger" >&nbsp;</span>');
                    $listItems.filter(':last-child').addClass('hm-tree-last');
                    $listItems.filter('li:not(:has(ul))').addClass('hm-tree-leaf');

                    _this.$container.find('.hm-tree-trigger')
                        .css({ 'vertical-align': 'top', 'display': 'inline-block', 'width': o.triggerBtnWidth })
                        .click(_this.triggerNode);

                    _this.$container.find('.hm-tree-item').css({ 'display': 'inline-block', 'clear': 'both' })
                    .click(function () { 
                        var $this = $(this);
                        var clickOn = _this.clickItem($this);
                        if (o.onClick && typeof o.onClick == 'function') 
                            o.onClick($this, _this.getId(), clickOn);
                    }).hover(function () { $(this).addClass('hm-tree-item-hover'); }, function () { $(this).removeClass('hm-tree-item-hover'); });

                    if (data.d.data.Title && data.d.data.Title.length > 0)
                        o.title = data.d.data.Title;

                    if (reloadId && !isNaN(reloadId))
                        _this.clickItem(_this.getItemById(reloadId));
                },
                beforeSend: function () { try { _this.$container.blockArea(true); } catch (e) { } },
                complete: function () { try { _this.$container.blockArea(false); } catch (e) { } },
                error: function (XMLHttpRequest, textStatus, errorThrown) { try { if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown); } catch (e) { } }
            });
        }
    }
    _this.$container.addClass('hm-tree-container ui-widget-content ').css('height', o.height)
                   .wrap($('<div class="hm-tree ui-widget" />').css('width', o.width));

    _this.loadData();



    if (o.showTitle) { 
        var $tilte = $('<div class="hm-tree-title" />').css('height', '16px');
        if (o.title && o.title.length > 0)
            $tilte.text(o.title);

        if (o.uiTitle)
            $tilte.addClass('ui-widget-header');
        if (o.uiTitleIcon)
            $tilte.prepend($('<span class="ui-icon" />').addClass(o.uiTitleIcon).css('float', 'left'));
        $tilte.insertBefore(_this.$container);

    }

    if (o.maintainMode) {
        var $btnContainer = $('<div class="hm-tree-button" />');
        _this.$container.before($btnContainer);

        if (o.buttons && o.buttons.length > 0) {
            for (var i = 0; i < o.buttons.length; i++) {
                var btn = o.buttons[i];
                if (!btn.separator) {
                    var $btn = $('<div class="tbutton" />');

                    if (!btn.name || btn.name == 0) btn.name = '';
                    if (!btn.display || btn.display.length == 0) btn.display = btn.name;

                    $btn.html('<span>' + btn.display + '</span>');

                    if (btn.bclass)
                        $btn.find('span').addClass(btn.bclass).css('padding-left', '20px');

                    $btn.attr('name', btn.name);


                    if (btn.onpress) {
                        $btn[0].onpress = btn.onpress;
                        $btn[0].key = btn.key || btn.name;
                        $btn.click( function () { this.onpress(this.key); } );
                    }
                    $btnContainer.append($btn);
                }
                else {
                  $btnContainer.append("<div class='tseparator' />");
                }
            }

        }

        if (o.defaultBtn) {

            var $toolContainer = $('<div class="hm-tree-button" />');
            _this.$container.after($toolContainer);

            $toolContainer.html('<div class="move tbutton"></div><div class="tseparator"></div><div class="first tbutton"></div><div class="prev tbutton"></div><div class="up tbutton"></div><div class="tseparator"></div><div class="down tbutton"></div><div class="next tbutton"></div><div class="last tbutton"></div><div class="tseparator"></div><div class="reload tbutton"></div><div class="tseparator"></div>');

            if (o.moveMode) {
                $toolContainer.find('.move').append($('<span>').text(o.moveText).css('padding-left', '20px'))
                .click(function () { 
                    var $selectedItem = _this.getSelected();
                    $btn = $(this);
                    if (!_this.moveMode) {
                        $btn.addClass('tbutton-active');
                        _this.moveMode = true;
                        
                        $('<span class="hm-tree-icon hm-tree-icon-move next">&nbsp;</span><span class="hm-tree-icon hm-tree-icon-move append">&nbsp;</span>')
                            .insertBefore(_this.$container.find('.hm-tree-item'))
                            .hover(function () {
                                var $this = $(this);
                                if ($this.parents('.hm-tree-block').length == 0) {
                                    $this.addClass('hm-tree-icon-block');
                                    if ($this.hasClass('next'))
                                        $this.css('cursor', 's-resize');
                                    else if ($this.hasClass('append'))
                                        $this.css('cursor', 'nw-resize');
                                }

                            }, function () {
                                $(this).removeClass('hm-tree-icon-block').css('cursor', 'static');
                            });

                        _this.$container.find('.hm-tree-icon-move.next').click(function () {
                            var $icon = $(this);
                            if ($icon.hasClass('hm-tree-icon-block') && _this.hadChoice()) {
                                var $li = _this.getSelectedLi();
                                var $target = $icon.parent('li');
                                _this.moveNext($li, $target);
                            }
                        });

                        _this.$container.find('.hm-tree-icon-move.append').click(function () {
                            var $icon = $(this);
                            if ($icon.hasClass('hm-tree-icon-block') && _this.hadChoice()) {
                                var $li = _this.getSelectedLi();
                                var $target = $icon.parent('li');
                                _this.moveAppend($li, $target);
                            }
                        });

                        _this.$container.find('.hm-tree-item > .hm-tree-icon').hide();

                        if ($selectedItem.length > 0) { 
                            $selectedItem.parent('li').addClass('hm-tree-block');
                        }

                        if ($.fn.block) {
                            _this.$container.prev('.hm-tree-button').children('div.tbutton').block({ message: '' });
                        }
                    }
                    else {
                        _this.closeMoveMode(); 
                    }
                });
            }
            else  {
                $toolContainer.find('.move').remove();
            }

            $toolContainer.find('.reload').click(function () { _this.reload(); });
            $toolContainer.find('.first').click(function () { _this.moveFirst(_this.getSelectedLi()); });
            $toolContainer.find('.last').click(function () { _this.moveLast(_this.getSelectedLi()); });
            $toolContainer.find('.prev').click(function () { _this.moveLeft(_this.getSelectedLi()); });
            $toolContainer.find('.up').click(function () { _this.moveUp(_this.getSelectedLi()); });
            $toolContainer.find('.next').click(function () { _this.moveRight(_this.getSelectedLi()); });
            $toolContainer.find('.down').click(function () { _this.moveDown(_this.getSelectedLi()); });

            if (o.keybordAble) {
                $(document).keydown(function (evt) {
                    var $item = _this.getSelectedLi();
                    if ($item.length > 0) {
                        switch (evt.which) {
                            case 37:
                                _this.moveLeft($item);
                                break;
                            case 38:
                                _this.moveUp($item);
                                break;
                            case 39:
                                _this.moveRight($item);
                                break;
                            case 40:
                                _this.moveDown($item);
                                break;
                        }
                    }
                });
            }
        }
    }

    if (o.showMsg && $.fn.fadeoutMessage) {
        var $msg = $('<div class="treeMsg" />').fadeoutMessage().insertBefore(_this.$container.parent('.hm-tree'));
        _this.$msg = $msg;
    }

    if (o.onPreRender && typeof o.onPreRender == 'function')
        o.onPreRender(_this);

    if (o.appendContainer && typeof o.appendContainer == 'string') {
        _this.$container.append($('#' + o.appendContainer));
    }

    //    $("li").draggable({
    //        cursor: 'crosshair',
    //        revert: "invalid",
    //        start: function() {
    //            $(this).addClass('hm-tree-block').css('position', 'relative');
    //        },
    //        stop: function() {
    //            $(this).removeClass('hm-tree-block').css('position', 'static');
    //        }
    //    });

    //    $('.hm-tree-item').droppable({
    //        accept: "li",
    //        tolerance: 'pointer',
    //        activeClass: "ui-state-highlight",
    //        hoverClass: 'hm-tree-draghover',
    //        drop: function(event, ui) {
    //            _this.DragToChildren(ui.draggable, $(this).parent('li'));
    //        }
    //    });

    //    $('.hm-tree-trigger').droppable({
    //        accept: "li",
    //        tolerance: 'pointer',
    //        activeClass: "ui-state-highlight",
    //        hoverClass: 'hm-tree-item-hover',
    //        drop: function(event, ui) {
    //            _this.DragToNext(ui.draggable, $(this).parent('li'));
    //        }
    //    });
};

$.treeView.prototype = {
    moveMode: false, 
    closeMoveMode: function () { 
        this.$container.parent().find('.tbutton.move').removeClass('tbutton-active');
        this.moveMode = false;

        this.$container.find('.hm-tree-icon-move').remove();
        this.$container.find('.hm-tree-item > .hm-tree-icon:hidden').show();

        if (this.hadChoice()) {
            var $item = this.getSelected();
            this.saveOrder($item);
            $item.parent('li').removeClass('hm-tree-block');
        }
        this.$container.prev('.hm-tree-button').children('div.tbutton').unblock();
    },
    reload: function (keep) {
        if (keep) {
            var id = this.getId();
            this.loadData(id); 
//            if (id > 0)
//                this.clickItem(this.getItemById(id));
        }
        else
            this.loadData();
        this.closeMoveMode();
    },
    triggerNode: function () { 
        var $icon = $(this);
        var $ul = $(this).parent('li').children('ul');
        if ($ul.length > 0) {
            if ($ul.is(':hidden')) {
                $ul.slideDown('fast');
                $icon.removeClass('hm-tree-close');
            }
            else {
                $ul.slideUp('fast');
                $icon.addClass('hm-tree-close');
            }
        }
    },
    showNode: function ($ul) { 
        if ($ul && $ul.length > 0 && $ul.is(':hidden')) {
            $ul.slideDown('fast');
            $ul.prevAll('hm-tree-trigger:first').removeClass('hm-tree-close');
        }
    },
    parseId: function ($item) { 
        if ($item.length == 0)
            return -999;
        $item = $($item);
        if ($item.is('.hm-tree-item'))
            $item = $item.parent('li');

        var id = parseInt($item.attr('id').substr(3) || -999, 10);
        return isNaN(id) ? -999 : id;
    },
    getItemById: function (id) { 
        return this.$container.find('#tn-' + id).children('.hm-tree-item');
    },
    getId: function () { 
        return this.parseId(this.getSelected());
    },
    getName: function () { 
        this.getSelected().attr('name');
    },
    getParent: function () {
        return this.getSelected().parents('ul:first').parent('li');
    },
    getParentId: function () {
        return this.parseId(this.getParent());
    },
    getSelected: function () {
        return this.$container.find('.hm-tree-item-selected:first');
    },
    getSelectedLi: function () {
        return this.$container.find('.hm-tree-item-selected:first').parent('li');
    },
    hadChoice: function (show) {
        var hadChoice = (this.$container.find('.hm-tree-item-selected').size() > 0);
        if (show && !hadChoice) this.showMsg('You Need choice a Node!');
        return hadChoice;
    },
    hadChild: function (show) {
        if (this.hadChoice()) {
            var hadChild = (this.getSelected().parent('li').find('ul>li').length > 0);
            if (show && hadChild) this.showMsg('This Node still have ChildNode, can`t Delete!');
            return hadChild;
        }
    },
    removeSelected: function () {
        var $selects = this.$container.find('.hm-tree-item-selected').removeClass('hm-tree-item-selected');

        if (this.moveMode) {
            this.$container.find('.hm-tree-block').removeClass('hm-tree-block');
            var _this = this;
            $selects.each(function () {
                _this.saveOrder(this);
            });
        }
    },
    removeNode: function ($li) { 
        var _this = this;
        $li.fadeOut('slow', function () {
            var $this = $(this);
            var $parent = $this.parents('li:first');
            var $prev = $this.prev();
            $this.remove();
            _this.checkStatus($parent, $prev);
        });
    },
    clickItem: function ($item) { 
        if ($item.is('li'))
            $item = $item.children('.hm-tree-item');
        if ($item.hasClass('hm-tree-item-selected')) {
            $item.removeClass('hm-tree-temp hm-tree-item-hover hm-tree-item-selected');
            if (this.moveMode) { 
                $item.parent('li').removeClass('hm-tree-block');
            }
            return false;
        }
        else {
            this.removeSelected();
            $item.removeClass('hm-tree-temp hm-tree-item-hover').addClass('hm-tree-item-selected');
            if (this.moveMode) {
                $item.parent('li').addClass('hm-tree-block');
            }
            return true;
        }

    },
    scrollTo: function ($item) {
        if (!$item || $item.length == 0) return;
        var containerTop = this.$container.offset().top;
        var containerHeight = this.$container.height();
        var itemTop = $item.offset().top;
        var itemHeight = $item.height();

        var move = false;
        if (itemTop - itemHeight - containerTop < 0) {
            itemTop = 0;
            move = true;
        }
        else {
            if ((itemTop + $item.height() - containerTop) > this.$container.height()) {
                itemTop = itemTop - containerTop + this.$container.scrollTop();
                move = true;
            }
        }

        if (move) {
            this.$container.animate({
                scrollTop: itemTop - 2
            }, 1000, 'easeOutBounce');
        }
    },
    saveOrder: function ($item) { 
        $item = $($item);
        if (this.options.saveOrder && typeof this.options.saveOrder == 'function') {
            var $lis = $item.parents('ul:first').children('li');
            var _this = this;

            var orders = $.map($lis, function (item, i) {
                return { Id: _this.parseId(item), Order: (i + 1) };
            });

            var $li = $item.is('li') ? $item : $item.parent('li');
            var node =
            {
                Id: _this.parseId($li),
                ParentId: _this.parseId($li.parent('ul').parent('li'))
            }


            this.options.saveOrder(node, orders);
        }
    },

    //    DragMode: false,
    //    DragToChildren: function($from, $to) {
    //        var $beforePrev = $from.prev();
    //        var $beforeParent = $from.parent()
    //        var $target = $to.children('ul');
    //        if ($target.length == 0)
    //            $target = $('<ul />').appendTo($to);
    //        $from.prependTo($target);
    //        this.checkStatus($from, $to, $from.prev(), $beforePrev, $beforeParent);
    //    },
    //    DragToNext: function($from, $to) {
    //        var $beforePrev = $from.prev();
    //        var $beforeParent = $from.parent()
    //        $from.insertAfter($to);
    //        this.checkStatus($from, $to, $beforePrev, $beforeParent);
    //    },


    moveNext: function ($li, $target) {
        if (this.moveMode && $li && $li.length > 0 && $target && $target.length > 0) {
            $li.insertAfter($target);
            this.checkStatus($li, $target);
            this.scrollTo($li); 
        }
    },

    moveAppend: function ($li, $target) {
        if (this.moveMode && $li && $li.length > 0 && $target && $target.length > 0) {
            if ($target.length > 0) {
                var $box = $target.children('ul');
                if ($box.length == 0)
                    $box = $('<ul />').appendTo($target);
                else
                    this.showNode($box);
                $li.prependTo($box);
                this.checkStatus($li, $target);
                this.scrollTo($li); 
            }
        }
    },

    moveFirst: function ($li) {
        if ($li && $li.length > 0) {
            var $target = this.$container.find('li:first');
            if (this.moveMode) {
                $li.insertBefore($target);
                this.checkStatus($li, $target);
                this.scrollTo($li);
            }
            else {
                $target = $target.children('.hm-tree-item');
                this.clickItem($target);
                this.scrollTo($target);
            }
        }
    },
    moveLast: function ($li) {
        if ($li && $li.length > 0) {
            var $target = this.$container.find('li:last');
            if (this.moveMode) { 
                $li.insertAfter($target);
                this.checkStatus($li, $target);
                this.scrollTo($li);
            }
            else {
                $target = $target.children('.hm-tree-item');
                this.clickItem($target);
                this.scrollTo($target);
            }
            //this.showNode($target.parents('ul:first'));
        }
    },
    moveUp: function ($li) {
        if ($li && $li.length > 0) {
            var $target = $li.prev();
            if ($target.length > 0) {
                if (this.moveMode) { 
                    $li.insertBefore($target);
                    this.checkStatus($li, $target);
                    this.scrollTo($li); 
                }
                else {
                    $target = $target.children('.hm-tree-item');
                    this.clickItem($target); 
                    this.scrollTo($target);
                }
                //this.showNode($target.parents('ul:first'));
            }
            else
                this.moveLeft($li);
        }
    },
    moveDown: function ($li) {
        if ($li && $li.length > 0) {
            var $target = $li.next();
            if ($target.length > 0) {
                if (this.moveMode) { 
                    $li.insertAfter($target);
                    this.checkStatus($li, $target);
                    this.scrollTo($li); 
                }
                else {
                    $target = $target.children('.hm-tree-item');
                    this.clickItem($target);
                    this.scrollTo($target);
                }
                //this.showNode($target.parents('ul:first'));
            }
        }

    },

    moveLeft: function ($li) {
        if ($li && $li.length > 0) {
            var $target = $li.parent('ul').parent('li');
            if ($target.length > 0) {
                if (this.moveMode) { 
                    $li.insertBefore($target);
                    this.checkStatus($li, $target);
                    this.scrollTo($li); 
                }
                else {
                    $target = $target.children('.hm-tree-item');
                    this.clickItem($target); 
                    this.scrollTo($target);
                }
                //this.showNode($target.parents('ul:first'));
            }
        }
    },
    moveRight: function ($li) {
        if ($li && $li.length > 0) { 
            if (this.moveMode) { 
                var $next = $li.next('li');
                if ($next.length > 0) { 
                    var $target = $next.children('ul');
                    if ($target.length == 0)
                        $target = $('<ul />').appendTo($next);
                    else
                        this.showNode($target);
                    $li.prependTo($target);
                    this.checkStatus($li, $next);
                    this.scrollTo($li); 
                }

            }
            else {

                var $target = $li.find('>ul>li:first>.hm-tree-item');
                if ($target.length > 0) {
                    this.clickItem($target);
                    this.scrollTo($target);
                    this.showNode($target.parents('ul:first'));
                }
            }
        }
    },
    checkStatus: function () { 
        //        for (var i = 0; i < arguments.length; i++) {
        //            var $li = arguments[i];

        //            if ($li.find('ul>li').length > 0)
        //                $li.removeClass('hm-tree-leaf');
        //            else
        //                $li.addClass('hm-tree-leaf');

        //            if ($li.is(':last-child'))
        //                $li.addClass('hm-tree-last');
        //            else
        //                $li.removeClass('hm-tree-last');
        //        }
        this.refresh(); 
    },
    refresh: function () {
        var $listItems = this.$container.find('li');
        $listItems.filter('.hm-tree-last,.hm-tree-leaf').removeClass('hm-tree-last hm-tree-leaf');
        $listItems.filter(':last-child').addClass('hm-tree-last');
        $listItems.filter('li:not(:has(ul))').addClass('hm-tree-leaf');
    },

    showMsg: function (msg) {
        if (this.options.showMsg && this.$msg != undefined && this.$msg.length && this.$msg.length > 0)
            this.$msg.showFadeout('alert', msg);
    }
};

$.fn.treeView = function (options, data) {
    return this.each(function () {
        if (!this.treeView) {
            this.treeView = new $.treeView(this, options);
        }
        if (typeof options == 'string') {
            switch (options.toLowerCase()) {
                default: break;
            }
        }
    });
};