function MuseumEvent(type, count, external)
{
    this.work = typeof external !== 'undefined' ? external : false;
    this.type = type;
    this.length = 0;
    this.radius = 0;
    this.direction = 0;
    this.sign = (Math.random() - 0.5 >= 0) ? 1 : -1;
    this.alpha = this.work ? 0.5 : 1;
    this.count = count;

    switch (this.type.name)
    {
        case 'electron':
            this.length = ticketoffice.radius.siliconSpace * ticketoffice.ratio + Math.round((ticketoffice.radius.ecal * ticketoffice.ratio + 10 - ticketoffice.radius.siliconSpace * ticketoffice.ratio) * Math.random());
            this.direction = Math.random() * Math.PI * 2;
            this.radius = 20 + Math.round((100 - 20) * Math.random());
            break;
        case 'jet':
            this.length = ticketoffice.radius.ecal * ticketoffice.ratio + Math.round((ticketoffice.radius.mucal * ticketoffice.ratio - ticketoffice.radius.ecal * ticketoffice.ratio) * Math.random());
            this.direction = Math.random() * Math.PI * 2;
            this.radius = 40 + Math.round((200 - 40) * Math.random());
            break;
        case 'muon':
            this.length = ticketoffice.radius.mucal * ticketoffice.ratio + 3 * ticketoffice.radius.mucalDark * ticketoffice.ratio + Math.round((4 * ticketoffice.radius.mucalLight * ticketoffice.ratio + 2 * ticketoffice.radius.mucalDark * ticketoffice.ratio) * Math.random());
            this.direction = Math.random() * Math.PI * 2;
            this.radius = 200 + Math.round((600 - 200) * Math.random());
            break;
    }

    this.draw(16, true);
};

MuseumEvent.prototype.draw = function(duration, init)
{
    init = typeof init !== 'undefined' ? init : false;

    var ctx = ticketoffice.events.ctx;
    var cx = ticketoffice.width / 2;
    var cy = ticketoffice.height / 2;

    ctx.save();

    ctx.globalAlpha = this.alpha;
    ctx.strokeStyle = this.type.color;
    ctx.fillStyle = this.type.color;
    ctx.lineWidth = 2;

    ctx.translate(cx, cy);
    ctx.rotate(this.direction);
    ctx.translate(-cx, -cy);

    ctx.beginPath();
    ctx.arc(cx + this.length / 2, cy + this.sign * Math.round(Math.sqrt(Math.abs(this.radius * this.radius - this.length * this.length / 4))), this.radius, - this.sign * Math.PI / 2 - Math.asin(this.length / (2 * this.radius)), - this.sign * Math.PI / 2 +  Math.asin(this.length / (2 * this.radius)), false);
    ctx.stroke();

    ctx.restore();

    if (!init) {
        this.alpha -= 0.03 / 16 * duration;
    }
};
