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

    if (activeMappings.length === 0) return;

    activeMappings.forEach(mapping => {
      const elements = document.querySelectorAll(mapping.selector);
      
      // Find the first matching visible element for this mapping
      const targetElement = Array.from(elements).find(element => {
        if (!isVisible(element)) return false;

        // Filter by text content if specified (using innerText for visible text only)
        if (mapping.text && !element.innerText.includes(mapping.text)) {
          return false;
        }
        return true;
      });

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const hint = document.createElement('div');
        hint.className = 'chc-hint';
        hint.textContent = mapping.label || mapping.key.toUpperCase();
        
        // Position hint at the top-left of the target element
        hint.style.top = (window.scrollY + rect.top - 10) + 'px';
        hint.style.left = (window.scrollX + rect.left) + 'px';
        
        document.body.appendChild(hint);
      }
    });
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    // Ensure the element has a physical size and is not hidden by CSS
    if (rect.width <= 0 || rect.height <= 0) return false;
    
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
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
        const elements = document.querySelectorAll(mapping.selector);
        // Find the first element that matches text filter and is visible
        const targetElement = Array.from(elements).find(el => {
          const textMatches = !mapping.text || el.textContent.includes(mapping.text);
          return textMatches && isVisible(el);
        });

        if (targetElement) {
          event.preventDefault();
          event.stopPropagation();
          targetElement.click();
          console.log('Custom Hotkey Clicker: Clicked', mapping.selector, mapping.text ? `with text "${mapping.text}"` : '');
        }
      }
    });
  }, true);
})();
