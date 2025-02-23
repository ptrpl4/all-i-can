document.addEventListener('DOMContentLoaded', () => {
    // Test image formats
    const imageFormats = [
        { format: 'WebP', src: 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==' },
        { format: 'AVIF', src: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=' },
        { format: 'JPEG', src: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBaRXhpZgAATU0AKgAAAAgABQMBAAUAAAABAAAASgMDAAEAAAABAAAAAFEQAAEAAAABAQAAAFERAAQAAAABAAAOxFESAAQAAAABAAAOxAAAAAAAAYagAACxj//bAEMAAgEBAgEBAgICAgICAgIDBQMDAwMDBgQEAwUHBgcHBwYHBwgJCwkICAoIBwcKDQoKCwwMDAwHCQ4PDQwOCwwMDP/bAEMBAgICAwMDBgMDBgwIBwgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIAAEAAQMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP38ooooA//Z' }
    ];

    const imageTests = document.getElementById('imageTests');
    
    imageFormats.forEach(({format, src}) => {
        const img = new Image();
        img.onload = () => {
            showResult(imageTests, `${format} Support`, true);
        };
        img.onerror = () => {
            showResult(imageTests, `${format} Support`, false);
        };
        img.src = src;
    });

    // Test video codecs
    const videoTests = document.getElementById('videoTests');
    const videoElement = document.createElement('video');
    
    const videoCodecs = [
        { codec: 'H.264', type: 'video/mp4; codecs="avc1.42E01E"' },
        { codec: 'VP8', type: 'video/webm; codecs="vp8"' },
        { codec: 'VP9', type: 'video/webm; codecs="vp9"' }
    ];

    videoCodecs.forEach(({codec, type}) => {
        const support = videoElement.canPlayType(type);
        showResult(videoTests, `${codec} Codec`, support !== '');
    });

    // Test audio support
    const audioTests = document.getElementById('audioTests');
    const audioElement = document.createElement('audio');
    
    const audioFormats = [
        { format: 'MP3', type: 'audio/mpeg' },
        { format: 'WAV', type: 'audio/wav' },
        { format: 'OGG', type: 'audio/ogg' }
    ];

    audioFormats.forEach(({format, type}) => {
        const support = audioElement.canPlayType(type);
        showResult(audioTests, `${format} Format`, support !== '');
    });
});

function showResult(container, feature, supported) {
    const div = document.createElement('div');
    div.className = `test-result ${supported ? 'success' : 'failure'}`;
    div.textContent = `${feature}: ${supported ? 'Supported' : 'Not Supported'}`;
    container.appendChild(div);
} 