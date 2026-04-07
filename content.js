(function() {
  let activeMappings = [];
  let dashboardOpen = false;

  // Initialize UI elements
  const badge = document.createElement('div');
  badge.className = 'chc-status-badge';
  badge.style.display = 'none';
  badge.title = 'Click to show Hotkey Dashboard (Alt+Shift+/)';
  document.body.appendChild(badge);

  const dashboard = document.createElement('div');
  dashboard.className = 'chc-dashboard';
  dashboard.style.display = 'none';
  document.body.appendChild(dashboard);

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
      
      badge.style.display = 'block';
      setTimeout(showHints, 1000);
      setInterval(showHints, 3000); // Re-run periodically for dynamic elements
    }
  });

  function showHints() {
    // Remove existing hints to avoid duplicates
    document.querySelectorAll('.chc-hint').forEach(hint => hint.remove());

    if (activeMappings.length === 0) return;

    let foundCount = 0;
    const mappingStatus = [];

    activeMappings.forEach(mapping => {
      let elements;
      try {
        elements = document.querySelectorAll(mapping.selector);
      } catch (e) {
        mappingStatus.push({ mapping, found: false });
        return;
      }
      
      const targetText = mapping.text ? mapping.text.trim().toLowerCase() : '';

      // Find the first matching visible element for this mapping
      const targetElement = Array.from(elements).find(element => {
        if (!isVisible(element)) return false;

        if (targetText) {
          const inner = (element.innerText || '').trim().toLowerCase();
          const content = (element.textContent || '').trim().toLowerCase();
          if (!inner.includes(targetText) && !content.includes(targetText)) {
            return false;
          }
        }
        return true;
      });

      if (targetElement) {
        foundCount++;
        mappingStatus.push({ mapping, found: true });
        
        const rect = targetElement.getBoundingClientRect();
        const hint = document.createElement('div');
        hint.className = 'chc-hint';
        hint.textContent = mapping.label || mapping.key.toUpperCase();
        
        // Position hint at the top-left of the target element
        hint.style.top = (window.scrollY + rect.top - 5) + 'px';
        hint.style.left = (window.scrollX + rect.left) + 'px';
        
        document.body.appendChild(hint);
      } else {
        mappingStatus.push({ mapping, found: false });
      }
    });

    badge.textContent = `${foundCount} / ${activeMappings.length}`;
    if (dashboardOpen) {
      updateDashboard(mappingStatus);
    }
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) return false;
    
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    
    const opacity = parseFloat(style.opacity);
    if (!isNaN(opacity) && opacity < 0.1) return false;
    
    return true;
  }

  function toggleDashboard() {
    dashboardOpen = !dashboardOpen;
    dashboard.style.display = dashboardOpen ? 'flex' : 'none';
    if (dashboardOpen) {
      showHints(); // Refresh
    }
  }

  function updateDashboard(mappingStatus) {
    dashboard.innerHTML = `
      <div class="chc-dashboard-header">
        <h3>Custom Hotkey Dashboard</h3>
        <span class="chc-dashboard-close">&times;</span>
      </div>
      <div class="chc-dashboard-body">
        ${mappingStatus.map(s => `
          <div class="chc-item ${s.found ? 'found' : 'missing'}">
            <div class="chc-item-status ${s.found ? 'found' : 'missing'}" title="${s.found ? 'Found' : 'Not found'}"></div>
            <div class="chc-item-info">
              <div class="chc-item-label">${s.mapping.label || s.mapping.key.toUpperCase()} ${s.mapping.comment ? `<span style="font-weight:normal; color:#888; font-size:12px;"> - ${s.mapping.comment}</span>` : ''}</div>
              <div class="chc-item-details" title="Selector: ${s.mapping.selector}${s.mapping.text ? `\nText Filter: ${s.mapping.text}` : ''}">
                ${s.mapping.selector} ${s.mapping.text ? `[Text: ${s.mapping.text}]` : ''}
              </div>
            </div>
            <div class="chc-item-key">
              ${s.mapping.alt ? '⌥' : ''}${s.mapping.shift ? '⇧' : ''}${s.mapping.ctrl ? '⌃' : ''}${s.mapping.meta ? '⌘' : ''}${s.mapping.key.toUpperCase()}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    dashboard.querySelector('.chc-dashboard-close').addEventListener('click', toggleDashboard);
  }

  badge.addEventListener('click', toggleDashboard);

  // Handle hotkey input
  window.addEventListener('keydown', (event) => {
    // 1. Check for Dashboard toggle (Alt + Shift + /)
    if (event.altKey && event.shiftKey && event.key === '/') {
      event.preventDefault();
      toggleDashboard();
      return;
    }

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
        const targetText = mapping.text ? mapping.text.trim().toLowerCase() : '';

        // Find the first element that matches text filter and is visible
        const targetElement = Array.from(elements).find(el => {
          if (!isVisible(el)) return false;
          if (targetText) {
            const inner = (el.innerText || '').trim().toLowerCase();
            const content = (el.textContent || '').trim().toLowerCase();
            if (!inner.includes(targetText) && !content.includes(targetText)) {
              return false;
            }
          }
          return true;
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
