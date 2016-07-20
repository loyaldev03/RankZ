﻿(function () {
    'use strict';

    angular.module('app', [
        // Angular modules 

        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ngMessages',
        'pascalprecht.translate',
        'tmh.dynamicLocale',

        // Custom modules 
        'login',

        // 3rd Party Modules
        'ui.router',                 // state provider
        'ui.bootstrap.modal',
        'mgcrea.ngStrap',
        'daterangepicker'
        //'color.picker',
        //'720kb.datepicker', //date picker for specials
        
    ]);
})();