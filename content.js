(function() {
  let activeMappings = [];

  // Load configuration from storage
  chrome.storage.sync.get('customHotkeyConfig', (data) => {
    if (!data.customHotkeyConfig) return;

    const currentUrl = window.location.href;
    const matchedConfig = data.customHotkeyConfig.find(config => {
      try {
        const regex = new RegExp(config.url);
        return regex.test(currentUrl);
      } catch (e) {
        console.error('Invalid URL regex in Custom Hotkey Clicker:', config.url);
        return false;
      }
    });

    if (matchedConfig) {
      activeMappings = matchedConfig.mappings;
      console.log('Custom Hotkey Clicker: Applied mappings for', matchedConfig.url);
      
      // We need to wait for elements to load, or just show them immediately.
      // For simplicity, we'll try to apply hints after a short delay and periodically check.
      setTimeout(showHints, 1000);
      setInterval(showHints, 3000); // Re-run periodically for dynamic elements
    }
  });

  function showHints() {
    // Remove existing hints to avoid duplicates
    document.querySelectorAll('.chc-hint').forEach(hint => hint.remove());

    activeMappings.forEach(mapping => {
      const elements = document.querySelectorAll(mapping.selector);
      elements.forEach(element => {
        if (!isVisible(element)) return;

        const rect = element.getBoundingClientRect();
        const hint = document.createElement('div');
        hint.className = 'chc-hint';
        hint.textContent = mapping.label || mapping.key.toUpperCase();
        
        // Position hint at the top-left of the target element
        hint.style.top = (window.scrollY + rect.top - 10) + 'px';
        hint.style.left = (window.scrollX + rect.left) + 'px';
        
        document.body.appendChild(hint);
      });
    });
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      window.getComputedStyle(el).display !== 'none' &&
      window.getComputedStyle(el).visibility !== 'hidden'
    );
  }

  // Handle hotkey input
  window.addEventListener('keydown', (event) => {
    // Do not trigger if user is typing in an input field
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || 
        document.activeElement.isContentEditable) {
      return;
    }

    const pressedKey = event.key.toLowerCase();
    const pressedCode = event.code.toLowerCase();

    activeMappings.forEach(mapping => {
      const targetKey = mapping.key.toLowerCase();
      // event.code is like 'KeyC', 'KeyS', 'Digit1', etc.
      const targetCode = targetKey.length === 1 ? 'key' + targetKey : targetKey;

      const keyMatches = (pressedKey === targetKey) || (pressedCode === targetCode);
      const altMatches = !!mapping.alt === event.altKey;
      const ctrlMatches = !!mapping.ctrl === event.ctrlKey;
      const shiftMatches = !!mapping.shift === event.shiftKey;
      const metaMatches = !!mapping.meta === event.metaKey;

      if (keyMatches && altMatches && ctrlMatches && shiftMatches && metaMatches) {
        const element = document.querySelector(mapping.selector);
        if (element && isVisible(element)) {
          event.preventDefault();
          event.stopPropagation();
          element.click();
          console.log('Custom Hotkey Clicker: Clicked', mapping.selector);
        }
      }
    });
  }, true);
})();
