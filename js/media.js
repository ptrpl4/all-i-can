document.addEventListener('DOMContentLoaded', () => {
    const { showResult, showPending, updateResult, markError, runSection } = window.BrowserTester;

    // Test image formats
    const imageFormats = [
        { format: 'WebP', src: 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==' },
        { format: 'AVIF', src: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=' },
        { format: 'JPEG', src: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBaRXhpZgAATU0AKgAAAAgABQMBAAUAAAABAAAASgMDAAEAAAABAAAAAFEQAAEAAAABAQAAAFERAAQAAAABAAAOxFESAAQAAAABAAAOxAAAAAAAAYagAACxj//bAEMAAgEBAgEBAgICAgICAgIDBQMDAwMDBgQEAwUHBgcHBwYHBwgJCwkICAoIBwcKDQoKCwwMDAwHCQ4PDQwOCwwMDP/bAEMBAgICAwMDBgMDBgwIBwgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIAAEAAQMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP38ooooA//Z' }
    ];

    const imageTests = document.getElementById('imageTests');
    runSection('Image Formats', imageTests, () => {
        // Rows are created up front so they stay in declaration order — decoding
        // is async and finishes in whatever order the browser gets to it.
        imageFormats.forEach(({ format, src }) => {
            const label = `${format} Support`;
            const row = showPending(imageTests, label);
            const img = new Image();

            // The section guard only covers this setup; anything that goes wrong
            // once decoding starts arrives here instead.
            img.onload = () => updateResult(row, label, true);
            img.onerror = () => updateResult(row, label, false);
            try {
                img.src = src;
            } catch (error) {
                markError(row, label, `Test errored: ${error.message}`);
            }
        });
    });

    // Test video codecs
    const videoTests = document.getElementById('videoTests');
    runSection('Video Codecs', videoTests, () => {
        const videoElement = document.createElement('video');

        const videoCodecs = [
            { codec: 'H.264', type: 'video/mp4; codecs="avc1.42E01E"' },
            { codec: 'VP8', type: 'video/webm; codecs="vp8"' },
            { codec: 'VP9', type: 'video/webm; codecs="vp9"' }
        ];

        videoCodecs.forEach(({ codec, type }) => {
            const support = videoElement.canPlayType(type);
            showResult(videoTests, `${codec} Codec`, support !== '');
        });
    });

    // Test audio support
    const audioTests = document.getElementById('audioTests');
    runSection('Audio Formats', audioTests, () => {
        const audioElement = document.createElement('audio');

        const audioFormats = [
            { format: 'MP3', type: 'audio/mpeg' },
            { format: 'WAV', type: 'audio/wav' },
            { format: 'OGG', type: 'audio/ogg' }
        ];

        audioFormats.forEach(({ format, type }) => {
            const support = audioElement.canPlayType(type);
            showResult(audioTests, `${format} Format`, support !== '');
        });
    });
});
