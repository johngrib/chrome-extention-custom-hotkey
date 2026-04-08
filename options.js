document.addEventListener('DOMContentLoaded', () => {
  const configContainer = document.getElementById('config-container');
  const configTextarea = document.getElementById('configJson');
  const saveBtn = document.getElementById('saveBtn');
  const addUrlBtn = document.getElementById('addUrlBtn');
  const toggleViewBtn = document.getElementById('toggleViewBtn');
  const uiView = document.getElementById('ui-view');
  const jsonView = document.getElementById('json-view');
  const statusDiv = document.getElementById('status');

  let currentConfig = [];

  // 1. Load configuration
  chrome.storage.sync.get('customHotkeyConfig', (data) => {
    currentConfig = data.customHotkeyConfig || [];
    renderUI();
  });

  // 2. Rendering logic
  function renderUI() {
    configContainer.innerHTML = '';
    currentConfig.forEach((group, groupIndex) => {
      const groupEl = createUrlGroup(group, groupIndex);
      configContainer.appendChild(groupEl);
    });
    // Sync textarea
    configTextarea.value = JSON.stringify(currentConfig, null, 2);
  }

  function createUrlGroup(group, groupIndex) {
    const div = document.createElement('div');
    div.className = 'url-group';
    div.innerHTML = `
      <h2>
        URL Pattern: 
        <input type="text" class="url-input" data-group="${groupIndex}">
        <button class="btn btn-delete delete-group-btn" data-group="${groupIndex}" style="margin-left:10px;">Delete Group</button>
      </h2>
      <table>
        <thead>
          <tr>
            <th>Selector</th>
            <th>Text Filter</th>
            <th>Comment</th>
            <th>Key</th>
            <th>Alt</th>
            <th>Shift</th>
            <th>Ctrl</th>
            <th>Meta</th>
            <th>Label</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody class="mappings-body"></tbody>
      </table>
      <button class="btn btn-add add-mapping-btn" data-group="${groupIndex}">+ Add Mapping</button>
    `;

    // Set value safely
    div.querySelector('.url-input').value = group.url || '';

    const tbody = div.querySelector('.mappings-body');
    group.mappings.forEach((mapping, mappingIndex) => {
      const row = createMappingRow(mapping, groupIndex, mappingIndex);
      tbody.appendChild(row);
    });

    // Event listeners for this group
    div.querySelector('.delete-group-btn').addEventListener('click', () => {
      currentConfig.splice(groupIndex, 1);
      renderUI();
    });

    div.querySelector('.add-mapping-btn').addEventListener('click', () => {
      group.mappings.push({ selector: '', text: '', comment: '', key: '', alt: false, shift: false, ctrl: false, meta: false, label: '' });
      renderUI();
    });

    return div;
  }

  function createMappingRow(mapping, groupIndex, mappingIndex) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" class="m-selector"></td>
      <td><input type="text" class="m-text"></td>
      <td><input type="text" class="m-comment"></td>
      <td><input type="text" class="m-key key-input"></td>
      <td><input type="checkbox" class="m-alt"></td>
      <td><input type="checkbox" class="m-shift"></td>
      <td><input type="checkbox" class="m-ctrl"></td>
      <td><input type="checkbox" class="m-meta"></td>
      <td><input type="text" class="m-label"></td>
      <td><button class="btn btn-delete delete-mapping-btn">Del</button></td>
    `;

    // Set values safely to avoid quote issues
    tr.querySelector('.m-selector').value = mapping.selector || '';
    tr.querySelector('.m-text').value = mapping.text || '';
    tr.querySelector('.m-comment').value = mapping.comment || '';
    tr.querySelector('.m-key').value = mapping.key || '';
    tr.querySelector('.m-alt').checked = !!mapping.alt;
    tr.querySelector('.m-shift').checked = !!mapping.shift;
    tr.querySelector('.m-ctrl').checked = !!mapping.ctrl;
    tr.querySelector('.m-meta').checked = !!mapping.meta;
    tr.querySelector('.m-label').value = mapping.label || '';

    tr.querySelector('.delete-mapping-btn').addEventListener('click', () => {
      currentConfig[groupIndex].mappings.splice(mappingIndex, 1);
      renderUI();
    });

    return tr;
  }

  // 3. Collection logic
  function collectDataFromUI() {
    const groups = [];
    const groupEls = document.querySelectorAll('.url-group');
    
    groupEls.forEach(groupEl => {
      const url = groupEl.querySelector('.url-input').value;
      const mappings = [];
      const rows = groupEl.querySelectorAll('tbody tr');
      
      rows.forEach(row => {
        mappings.push({
          selector: row.querySelector('.m-selector').value,
          text: row.querySelector('.m-text').value,
          comment: row.querySelector('.m-comment').value,
          key: row.querySelector('.m-key').value,
          alt: row.querySelector('.m-alt').checked,
          shift: row.querySelector('.m-shift').checked,
          ctrl: row.querySelector('.m-ctrl').checked,
          meta: row.querySelector('.m-meta').checked,
          label: row.querySelector('.m-label').value
        });
      });
      
      groups.push({ url, mappings });
    });
    return groups;
  }

  // 4. Global Event Handlers
  addUrlBtn.addEventListener('click', () => {
    currentConfig.push({ url: '.*', mappings: [] });
    renderUI();
  });

  toggleViewBtn.addEventListener('click', () => {
    if (uiView.style.display === 'none') {
      // Switch to UI View: Sync JSON to UI first
      try {
        currentConfig = JSON.parse(configTextarea.value);
        renderUI();
        uiView.style.display = 'block';
        jsonView.style.display = 'none';
      } catch (e) {
        alert('Invalid JSON in editor. Fix it before switching back.');
      }
    } else {
      // Switch to JSON View: Sync UI to JSON first
      currentConfig = collectDataFromUI();
      configTextarea.value = JSON.stringify(currentConfig, null, 2);
      uiView.style.display = 'none';
      jsonView.style.display = 'block';
    }
  });

  saveBtn.addEventListener('click', () => {
    let dataToSave;
    if (uiView.style.display === 'none') {
      try {
        dataToSave = JSON.parse(configTextarea.value);
      } catch (e) {
        showStatus('Invalid JSON: ' + e.message, 'error');
        return;
      }
    } else {
      dataToSave = collectDataFromUI();
    }

    chrome.storage.sync.set({ customHotkeyConfig: dataToSave }, () => {
      showStatus('All settings saved successfully!', 'status');
      currentConfig = dataToSave;
      renderUI();
    });
  });

  function showStatus(msg, className) {
    statusDiv.textContent = msg;
    statusDiv.className = className;
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = '';
    }, 3000);
  }
});
