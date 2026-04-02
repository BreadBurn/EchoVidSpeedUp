document.getElementById('startBtn').addEventListener('click', async () => {
  const speed = parseFloat(document.getElementById('speed').value);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { 
        tabId: tab.id, 
        allFrames: true // Hunts down iframes
    }, 
    world: "MAIN", // Runs exactly like the developer console
    func: (targetSpeed) => {
      // Clear existing interval if you click Start multiple times
      if (window.echoSpeedInterval) clearInterval(window.echoSpeedInterval);
      
      // Re-apply the exact logic you tested
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

document.getElementById('stopBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    world: "MAIN",
    func: () => {
      if (window.echoSpeedInterval) {
        clearInterval(window.echoSpeedInterval);
        window.echoSpeedInterval = null;
        
        // Reset to normal speed when stopped
        document.querySelectorAll('video').forEach(video => {
          video.playbackRate = 1.0;
        });
      }
    }
  });
});