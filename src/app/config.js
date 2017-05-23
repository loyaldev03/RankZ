(function () {
    'use strict';
    var app = angular.module('app');

    app.config(configure);

    configure.$inject = ['$httpProvider','$locationProvider', '$facebookProvider', '$sceDelegateProvider'];

    function configure($httpProvider, $locationProvide, $facebookProvider, $sceDelegateProvider) {

        // http interceptor
        // My App ID: 1494723870571848
        $httpProvider.interceptors.push('httpInterceptor');
        $facebookProvider.setAppId('1494723870571848');
        
        //SCE 
        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain.  Notice the difference between * and **.
            'https://api.instagram.com/**'
        ]);
    }
})();
