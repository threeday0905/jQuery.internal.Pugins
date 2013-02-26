/* 
 *  Plugin Name: $.fn.dlTabs v1.0
 *  Author: Herman Lee
 *  Date: 2012.01
 *  Description: Transform <dl /> <dt /> <dd /> tags into a tab widget.
 */

$.fn.dlTabs = function(inopts) {
  var opts = $.extend({
    targetKey: 'data-section-key',
    activeClass: 'active',
    showFn: 'show'
  }, inopts || {});
  
  return this.each(function() {
    var $container = $(this), $tabs = $container.find('dt'), $contents = $container.find('dd'), $firstTab = $tabs.first();
    $tabs.bind('click.dlTabs', function(event) {
      var $tab = $(this), tabKey = $tab.attr(opts.targetKey) || '', $content;
      if (!$tab.hasClass(opts.activeClass) && tabKey && tabKey.length) {
        $tabs.removeClass(opts.activeClass);
        $tab.addClass(opts.activeClass);
        $content = $contents.hide().filter(tabKey)[opts.showFn]();
        if (typeof opts.onSwitch === 'function') {
          opts.onSwitch($tab, $content);
        }
      }
      event.preventDefault(); 
      return false;
    });
    if (window.location.hash) {
      $firstTab = $tabs.filter('[' + opts.targetKey + '=' + window.location.hash + ']');
      if (!$firstTab.length) {
        $firstTab = $tabs.first();
      }
    }
    
    if ($firstTab && $firstTab.length) {
      $firstTab.trigger('click.dlTabs');
    }
  });
};