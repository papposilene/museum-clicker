var analytics =
{
    enabled: true,

    screens:
    {
        main: 'Main screen',
        about: 'About',
        achievements: 'Achievements',
        info: 'Museum information'
    },

    events:
    {
        categoryCollection: 'Collection',
        categoryHR: 'HR',
        categoryUpgrades: 'Upgrades',
        
        actionCollection: 'Collect',
        actionHire: 'Hire',
        actionBuy: 'Buy'
    },
    
    init: function()
    {
        if (typeof Helpers.analytics === 'undefined' || Helpers.analytics == '') {
            analytics.enabled = false;
            return;
        }
        
        _paq.push('create', Helpers.analytics);
        _paq.push('set', { 'appName': 'Museum Clicker', 'appId': 'nl.psln.museum-clicker', 'appVersion': '0.9' });
        _paq.push('set', 'anonymizeIp', true);


        $('#myModal').on('show.bs.modal', function (e) {
            analytics.sendScreen(analytics.screens.about);
        });
        $('#myModal').on('hide.bs.modal', function (e) {
            analytics.sendScreen(analytics.screens.main);
        });

        $('#achievements-modal').on('show.bs.modal', function (e) {
            analytics.sendScreen(analytics.screens.achievements);
        });
        $('#achievements-modal').on('hide.bs.modal', function (e) {
            analytics.sendScreen(analytics.screens.main);
        });

        $('#infoBox').on('show.bs.modal', function (e) {
            analytics.sendScreen(analytics.screens.info);
        });
        $('#infoBox').on('hide.bs.modal', function (e) {
            analytics.sendScreen(analytics.screens.main);
        });
    },
    
    sendScreen: function(type)
    {
        if (!analytics.enabled || typeof type === 'undefined') {
            return;
        }
        
        _paq.push('send', 'screenview', { 'screenName': type });
    },
    
    sendEvent: function(category, action, label, value)
    {
        if (!analytics.enabled || typeof category === 'undefined' || typeof action === 'undefined' || typeof label === 'undefined' || typeof value === 'undefined') {
            return;
        }
        
        _paq.push(['trackEvent', category, action, label, value, {'screenName': analytics.screens.main }]);
    }
};
