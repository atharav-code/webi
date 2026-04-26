const actionModal = document.getElementById('action-modal');
const actionContent = document.getElementById('action-content');
const modalClose = document.getElementById('modal-close');

const actions = {
  upload: {
    title: 'Upload Water Report',
    description: 'Submit a quick water quality report for your area. Upload a photo or add details so the community can improve water safety together.',
    html: `
      <form id="upload-form">
        <label for="report-file">Choose a report file</label>
        <input id="report-file" type="file" accept="image/*,.pdf" />
        <label for="report-details">Report notes</label>
        <textarea id="report-details" rows="5" placeholder="Describe the issue or observation..."></textarea>
        <button class="btn btn-primary panel-button" type="submit">Submit Report</button>
      </form>
    `,
    onSubmit: (event) => {
      event.preventDefault();
      const details = document.getElementById('report-details').value.trim();
      actionContent.innerHTML = `<h4>Report submitted</h4><p>Your water report was received. Thank you for helping the community stay informed.${details ? ` Note: ${details}` : ''}</p>`;
    }
  },
  water: {
    title: 'Track Water Progress',
    description: 'See local water use statistics and learn how small actions add up. This panel highlights key water-saving milestones we can work toward.',
    html: `
      <div class="stat-card">
        <strong>45%</strong>
        <span>reduction in indoor water use with efficient fixtures.</span>
      </div>
      <div class="stat-card">
        <strong>12 liters</strong>
        <span>saved per day by choosing a shorter shower.</span>
      </div>
      <button class="btn btn-primary panel-button" id="view-challenge">Start a saving challenge</button>
    `,
    onInteractive: () => {
      const challengeButton = document.getElementById('view-challenge');
      if (challengeButton) {
        challengeButton.addEventListener('click', () => {
          actionContent.innerHTML = `<h4>Water saving challenge</h4><p>Try reducing your shower time by 2 minutes this week and track how much water you save. Small changes together make a big impact.</p>`;
        });
      }
    }
  },
  chat: {
    title: 'Group Chat',
    description: 'Join the community discussion on water conservation ideas, local clean-up events, and support for each other.',
    html: `
      <ul class="chat-list">
        <li class="chat-item"><strong>Emma:</strong> Anyone tried a water-saving shower timer? It helped cut our usage by 15%!</li>
        <li class="chat-item"><strong>Rohit:</strong> I found a great reusable rain barrel idea for my garden.</li>
        <li class="chat-item"><strong>Priya:</strong> Let’s organize a local cleanup this weekend.</li>
      </ul>
      <button class="btn btn-primary panel-button" id="join-chat">Join the chat</button>
    `,
    onInteractive: () => {
      const joinChat = document.getElementById('join-chat');
      if (joinChat) {
        joinChat.addEventListener('click', () => {
          actionContent.innerHTML = `<h4>Welcome to the chat</h4><p>You are now connected. Share your water-saving ideas and help the group move toward cleaner local water for everyone.</p>`;
        });
      }
    }
  },
  action: {
    title: 'Take Action',
    description: 'Complete a simple water-saving task and feel the positive effect you create for your home and community.',
    html: `
      <p>Choose one of the quick actions below and commit to it for the next 7 days.</p>
      <ul class="chat-list">
        <li class="chat-item">Turn off the tap while brushing teeth.</li>
        <li class="chat-item">Collect rainwater for plants.</li>
        <li class="chat-item">Use a broom instead of a hose to clean sidewalks.</li>
      </ul>
      <button class="btn btn-primary panel-button" id="start-action">I will do it</button>
    `,
    onInteractive: () => {
      const startAction = document.getElementById('start-action');
      if (startAction) {
        startAction.addEventListener('click', () => {
          actionContent.innerHTML = `<h4>Action started</h4><p>Great choice! Track your progress through the week and share your results with the community.</p>`;
        });
      }
    }
  }
};

function showActionPanel(actionKey) {
  const action = actions[actionKey];
  if (!action) return;

  actionModal.classList.remove('hidden');
  actionModal.setAttribute('aria-hidden', 'false');
  actionContent.innerHTML = `<h4>${action.title}</h4><p>${action.description}</p>${action.html}`;

  if (action.onInteractive) {
    requestAnimationFrame(() => action.onInteractive());
  }

  const uploadForm = document.getElementById('upload-form');
  if (uploadForm) {
    uploadForm.addEventListener('submit', action.onSubmit);
  }
}

function closeModal() {
  actionModal.classList.add('hidden');
  actionModal.setAttribute('aria-hidden', 'true');
  actionContent.innerHTML = '';
}

modalClose.addEventListener('click', closeModal);
actionModal.addEventListener('click', (event) => {
  if (event.target === actionModal) {
    closeModal();
  }
});

const actionButtons = document.querySelectorAll('.action-btn');
actionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const actionKey = button.dataset.action;
    showActionPanel(actionKey);
  });
});
