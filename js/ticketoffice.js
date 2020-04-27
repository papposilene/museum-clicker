var ticket =
{
    core:
    {
        canvas: null,
        ctx: null
    },

    events:
    {
        canvas: null,
        ctx: null,
        list: [],
    },

    visible: true,

    width: 400,
    height: 400,

    ratio: 1,

    colors: 
    {
        siliconRing: '#FFF371',
        siliconRingLine: '#EAC918',
        ecal: '#C5FF82',
        ecalLine: '#9EFF28',
        hcal: '#E1FF79',
        hcalLine: '#C9FF2D',
        lightRing: '#A0B3FF',
        lightRingLine: '#A0B3FF',
        darkRing: '#7280B8',
        darkRingLine: '#7280B8',
        mucalLight: '#FFDFB7',
        mucalLightLine: '#FFDFB7',
        mucalDark: '#EA301F',
        mucalDarkLine: '#C5291A'
    },

    radius:
    {
        siliconInner: 10,
        silicon: 30,
        siliconSpace: 35,
        ecal: 50,
        hcal: 80,
        darkRing1: 83,
        darkRing1Space: 86,
        lightRing: 92,
        lightRingSpace: 94,
        darkRing2: 100,

        mucal: 107,
        mucalLight: 8,
        mucalDark: 18
    },

    tracks:
    [
        {
            name: 'visitor',
            color: '#0016EA'
        },

        {
            name: 'acquisition',
            color: '#0B7700'
        },
        
        {
            name: 'donation',
            color: '#775400'
        }
    ],

    lastRender: 0,

    animate: function(time)
    {
        var duration = typeof time !== 'undefined' ? time - ticket.lastRender : 16;
        ticket.lastRender = time;

        requestAnimFrame(ticket.animate);
        ticket.draw(duration);
    },

    init: function(baseSize)
    {
        ticket.core.canvas = document.getElementById('ticket-core');
        ticket.core.ctx = ticket.core.canvas.getContext('2d');
        //ticket.core.ctx = new C2S(400,400);

        ticket.events.canvas = document.getElementById('ticket-visitors');
        ticket.events.ctx = ticket.events.canvas.getContext('2d');

        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = ticket.core.ctx.webkitBackingStorePixelRatio ||
                                ticket.core.ctx.mozBackingStorePixelRatio ||
                                ticket.core.ctx.msBackingStorePixelRatio ||
                                ticket.core.ctx.oBackingStorePixelRatio ||
                                ticket.core.ctx.backingStorePixelRatio || 1;

        var ratio = devicePixelRatio / backingStoreRatio;

        ticket.ratio = baseSize / 400;

        ticket.width = baseSize;
        ticket.height = baseSize;

        ticket.core.canvas.width = baseSize;
        ticket.core.canvas.height = baseSize;

        ticket.events.canvas.width = baseSize;
        ticket.events.canvas.height = baseSize;

        if (devicePixelRatio !== backingStoreRatio) {
            var oldWidth = ticket.core.canvas.width;
            var oldHeight = ticket.core.canvas.height;

            ticket.core.canvas.width = oldWidth * ratio;
            ticket.core.canvas.height = oldHeight * ratio;
            ticket.core.canvas.style.width = oldWidth + 'px';
            ticket.core.canvas.style.height = oldHeight + 'px';

            ticket.events.canvas.width = oldWidth * ratio;
            ticket.events.canvas.height = oldHeight * ratio;
            ticket.events.canvas.style.width = oldWidth + 'px';
            ticket.events.canvas.style.height = oldHeight + 'px';

            // now scale the context to counter
            // the fact that we've manually scaled
            // our canvas element
            ticket.core.ctx.scale(ratio, ratio);
            ticket.events.ctx.scale(ratio, ratio);
        }

        ticket.coreDraw();
        ticket.animate();
    },

    coreDraw: function()
    {
        var ctx = ticket.core.ctx;
        var cx = ticket.width / 2;
        var cy = ticket.height / 2;
        
        v = Canvg.from(ctx, 'assets/icons/svg/048-museum.svg');
        
        // Start SVG rendering with animations and mouse handling.
        v.start();
        
        /*
        var img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        }
        img.src = "assets/icons/svg/048-museum.svg";
        */
    },

    addEvent: function()
    {
        var num = Math.max(3, Math.ceil(15 * Math.random()));

        for (var i = 0; i < num; i++) {
            var index = Math.round(Math.random() * (ticket.tracks.length - 1));
            var event = new MuseumEvent(ticket.tracks[index], num);
            ticket.events.list.push(event);
        }
    },

    addEventExternal: function(numWorkers)
    {
        if (!ticket.visible) {
            return;
        }

        var num = Math.min(20 * numWorkers / 10, 20);

        for (var i = 0; i < num; i++) {
            var index = Math.round(Math.random() * (ticket.tracks.length - 1));
            var event = new MuseumEvent(ticket.tracks[index], num, true);
            ticket.events.list.push(event);
        }
    },

    draw: function(duration)
    {
        ticket.events.ctx.clearRect(0, 0, ticket.width, ticket.height);

        var del = -1;
        for (var e in ticket.events.list) {
            if (ticket.events.list[e].alpha > 0) {
                ticket.events.list[e].draw(duration);
            } else {
                del = e;
            }
        }

        if (del > 0) {
            ticket.events.list.splice(0, del);
        }
    }
};

window.requestAnimFrame = (function(){
    return window.requestAnimationFrame       || 
           window.webkitRequestAnimationFrame || 
           window.mozRequestAnimationFrame    || 
           window.oRequestAnimationFrame      || 
           window.msRequestAnimationFrame     || 
           function(/* function */ callback, /* DOMElement */ element){
               window.setTimeout(callback, 1000 / 60);
           };
})();

(function() { ticket.init(400); $('#ticket').width(400).height(400); })();
