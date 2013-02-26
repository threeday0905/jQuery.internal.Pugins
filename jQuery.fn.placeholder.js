$.fn.placeholder = function(inopts) {
  var opts = $.extend({
    className: 'placeholder'
  }, inopts || {}), $inputs;
  
  if (!( 'placeholder' in window.document.createElement("input")) ) {
  
    $inputs = this.is('form') ? this.find('[placeholder]') : this.filter('[placeholder]');
    $inputs.bind('focus.placeholder blur.placeholder', function(event) {
      var $input = $(this), val = ($input.val() || ''), placeholder = ($input.attr('placeholder') || '');
      if (!placeholder.length) { return; }
      $input.removeClass(opts.className);
      if (event.type === 'focus' && val === placeholder) {
        $input.val('').removeClass(opts.className);
      } else if (event.type === 'blur' &&  (!val.length || val === placeholder)) {
        $input.val(placeholder).addClass(opts.className);
      }
    }).trigger('blur.placeholder').parents('form').submit(function() {
      $inputs.each(function() {
        var $input = $(this);
        if ($input.val() === $input.attr('placeholder')) {
          $input.val('');
        }
      });
    }).bind('reset', function() {
      window.setTimeout(function() {
        $inputs.trigger('blur.placeholder');
      });
    });
  }
  return this;
};