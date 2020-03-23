const sel = (selector) => document.querySelector(selector);
let sessions;
const getSession = (username) => sessions[username];
const switchSession = (user) => {
  chrome.runtime.sendMessage({ method: 'setCookie', data: { name: 'oauth_token', value: getSession(user) } }, () => parent.postMessage('_scam_reload', '*'));
};

const injectLoggedOutSwitcher = () => {
  if (sessions) {
    const publicSignIn = sel('.provider-buttons');
    const scamDiv = document.createElement('div');
    const scamBtn = document.createElement('button');
    const accountSelector = document.createElement('select');
    scamDiv.setAttribute('class', 'form-row');
    scamBtn.setAttribute('class', 'provider-button sc-button sc-button-large');
    accountSelector.setAttribute('class', 'provider-button sc-button sc-button-large');
    accountSelector.setAttribute('style', 'height: 100%');
    scamBtn.innerText = 'Saved accounts';
    scamDiv.appendChild(scamBtn);
    publicSignIn.appendChild(scamDiv);
    const firstOption = document.createElement('option');
    firstOption.innerText = 'Accounts';
    firstOption.disabled = true;
    firstOption.selected = true;
    accountSelector.appendChild(firstOption);
    Object.keys(sessions).forEach((accountName) => {
      const accountEl = document.createElement('option');
      accountEl.value = accountName;
      accountEl.innerText = accountName;
      accountSelector.appendChild(accountEl);
    });

    scamBtn.onclick = () => {
      scamBtn.parentNode.replaceChild(accountSelector, scamBtn);
    };

    accountSelector.onchange = () => {
      switchSession(accountSelector.value);
    };
  }
};

window.addEventListener('message', (message) => {
  const { origin, data } = message;
  if (origin !== 'https://soundcloud.com') return;

  if (Array.isArray(data)) {
    const [name, sessionData] = data;
    if (name === '_scam_sessions') {
      sessions = sessionData;
    }
    injectLoggedOutSwitcher();
  }
}, false);
