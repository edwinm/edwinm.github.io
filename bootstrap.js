function loadEditor() {
    if (typeof isLoaded == 'undefined') {
        var script = document.createElement('script');
        script.src = 'edit.js';
        document.head.appendChild(script);
    } else {
        if ($('.controls').hasClass('hidden')) {
            $('.controls').removeClass('hidden');
        } else {
            $('.controls').addClass('hidden');
        }
    }
}
