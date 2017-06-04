// Private

// Public
module.exports = Result;

//repeatView - firstView
// SpeedIndex
// TTFB
// loadTime
// render
// fullyLoaded

function Result(url, firstView, repeatView, location) {
    this.metrics = {
        'url'  : url,
        'location'  : location, 
        'firstView' : {
            'speedIndex' : firstView['SpeedIndex'],
            'TTFB' : firstView['TTFB'],
            'loadTime' : firstView['loadTime'],
            'render' : firstView['render'],
            'fullyLoaded' : firstView['fullyLoaded'],
         },
        'repeatView' : {
            'speedIndex' : repeatView['SpeedIndex'],
            'TTFB' : repeatView['TTFB'],
            'loadTime' : repeatView['loadTime'],
            'render' : repeatView['render'],
            'fullyLoaded' : repeatView['fullyLoaded'],
        }
    }
}

Result.prototype.getMetrics = function() {
    return this.metrics;
}
