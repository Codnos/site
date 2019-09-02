window.blueimp.Gallery.prototype.audioFactory = function(obj, callback) {
    var that = this
    var audio = document.createElement('audio');
    audio.setAttribute('controls', '');
    var source = document.createElement('source');
    source.setAttribute('type', 'audio/mpeg');
    var unableToLoadText = document.createTextNode('Unable to load audio file');
    audio.appendChild(source);
    audio.appendChild(unableToLoadText);
    var url = obj
    if (typeof url !== 'string') {
      url = this.getItemProperty(obj, 'href')
      title = this.getItemProperty(obj, 'title')
    }
    source.setAttribute('src', url);
    audio.className = audio.className + ' audio-content';
    this.setTimeout(callback, [
        {
          type: 'load',
          target: audio
        }
      ])
    return audio;
};