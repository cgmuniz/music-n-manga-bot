module.exports = {
    calcular: ( segundos ) => {
        hours = Math.floor(segundos / 3600);
        minutes = Math.floor((segundos - (hours * 3600)) / 60);
        seconds = segundos - (hours * 3600) - (minutes * 60);
        timeString = hours != 0 ? (hours.toString().padStart(2, '0') + ':') : "" +
            minutes.toString().padStart(2, '0') + ':' +
            seconds.toString().padStart(2, '0');

        return timeString
    },
}