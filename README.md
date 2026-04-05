# Browser Capabilities Tester

A static browser test site for checking browser APIs, media support, graphics capabilities, page context, and user interaction events.

Built with plain HTML, CSS, and JavaScript. The graphics page currently uses `gl-matrix` from a CDN for the WebGL demo.

## Features

- **Media Support**: Test image formats, video codecs, and audio format support
- **Forms & Input**: Check input types and built-in form features
- **Security APIs**: Check WebAuthn, Web Crypto, and current page security context
- **Web APIs**: Verify support for storage, device, communication, and performance APIs
- **User Data**: Display browser, system, network, and preference information exposed by the runtime
- **Graphics**: Test WebGL, Canvas, CSS, SVG, and font-related capabilities
- **Performance**: Run lightweight JavaScript and DOM benchmarks
- **Accessibility-Related APIs**: Check DOM and CSS APIs related to accessibility
- **Activity Tracking**: Monitor user interactions and browser events on the current page

## Technologies

- Plain JavaScript
- HTML5
- CSS3
- `gl-matrix` via CDN on the graphics page
- Hosted on GitHub Pages

## Browser Support

Works in modern browsers that support:
- ES6+ JavaScript
- Modern Web APIs
- HTML5 features

### Core Requirements
- Modern JavaScript (ES6+)
- HTML5 and CSS3
- WebGL for graphics testing

### Tested Browsers
- Not currently tracked in this repository

### API Support
- Geolocation API
- WebAuthn
- Crypto API
- WebGL and Canvas
- IndexedDB and LocalStorage
- Network Information API where available

### Security Features
- Current page secure-context state
- Current page cross-origin isolation state
- HTTPS page load state
- Web Crypto algorithm availability

## Notes

- Results reflect the current browser and page context. Some checks are affected by HTTPS, permissions, browser policy, or cross-origin isolation.
- The accessibility page does not test real assistive technology behavior. It reports browser-exposed DOM and CSS features related to accessibility.
- HSTS and other server-side policies cannot be fully verified from client-side JavaScript alone.
