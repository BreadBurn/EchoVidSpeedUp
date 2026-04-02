// Load all frames into the dropdown when the popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const select = document.getElementById('frameSelect');
  
  try {
    const frames = await chrome.webNavigation.getAllFrames({ tabId: tab.id });
    select.innerHTML = ''; // Clear loading text
    
    frames.forEach(frame => {
      const option = document.createElement('option');
      option.value = frame.frameId;
      
      // Try to extract just the domain name to make it look like the browser console
      let displayName = "Unknown Frame";
      if (frame.frameId === 0) {
        displayName = "top (Main Page)";
      } else if (frame.url) {
        try {
          displayName = new URL(frame.url).hostname;
        } catch (e) {
          displayName = frame.url.substring(0, 30) + "...";
        }
      }
      
      option.textContent = `${displayName} (ID: ${frame.frameId})`;
      select.appendChild(option);
    });
  } catch (err) {
    select.innerHTML = '<option value="0">top (Main Page)</option>';
    console.error("Failed to load frames", err);
  }
});

// Start Button Logic
document.getElementById('startBtn').addEventListener('click', async () => {
  const speed = parseFloat(document.getElementById('speed').value);
  const frameId = parseInt(document.getElementById('frameSelect').value);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { 
        tabId: tab.id,
        frameIds: [frameId] // Inject ONLY into the selected context
    }, 
    world: "MAIN", 
    func: (targetSpeed) => {
      if (window.echoSpeedInterval) clearInterval(window.echoSpeedInterval);
      
      window.echoSpeedInterval = setInterval(() => {
        document.querySelectorAll('video').forEach(video => {
          if (video.playbackRate !== targetSpeed) {
            video.playbackRate = targetSpeed;
          }
        });
      }, 100);
    },
    args: [speed]
  });
});

// Stop Button Logic
document.getElementById('stopBtn').addEventListener('click', async () => {
  const frameId = parseInt(document.getElementById('frameSelect').value);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { 
        tabId: tab.id,
        frameIds: [frameId] 
    },
    world: "MAIN",
    func: () => {
      if (window.echoSpeedInterval) {
        clearInterval(window.echoSpeedInterval);
        window.echoSpeedInterval = null;
        
        document.querySelectorAll('video').forEach(video => {
          video.playbackRate = 1.0;
        });
      }
    }
  });
});