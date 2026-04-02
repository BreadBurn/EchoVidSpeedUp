document.getElementById('startBtn').addEventListener('click', async () => {
  const speed = parseFloat(document.getElementById('speed').value);
  
  // Get the current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Inject and run the script inside the active tab
  chrome.scripting.executeScript({
    target: { 
        tabId: tab.id, 
        allFrames: true // This is crucial: it bypasses the Canvas/Blackboard iframe trap automatically
    }, 
    func: startSpeedLoop,
    args: [speed]
  });
});

document.getElementById('stopBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    func: stopSpeedLoop
  });
});

// --- These functions get injected directly into the webpage ---

function startSpeedLoop(targetSpeed) {
  // Clear any existing loops first so we don't create multiple overlapping loops
  if (window.echoSpeedInterval) {
    clearInterval(window.echoSpeedInterval);
  }

  // Your interval logic
  window.echoSpeedInterval = setInterval(() => {
    document.querySelectorAll('video').forEach(video => {
      if (video.playbackRate !== targetSpeed) {
        video.playbackRate = targetSpeed;
      }
    });
  }, 100);
}

function stopSpeedLoop() {
  if (window.echoSpeedInterval) {
    clearInterval(window.echoSpeedInterval);
    window.echoSpeedInterval = null;
    
    // Optional: Reset speed back to 1.0 when stopped
    document.querySelectorAll('video').forEach(video => {
      video.playbackRate = 1.0;
    });
  }
}