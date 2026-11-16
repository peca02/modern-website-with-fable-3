#!/bin/sh
# Rebuild and serve the production build for the Playwright scripts. A stale server returns 500 for new chunks.
pkill -f next-server
npm run -s build >/dev/null || exit 1
(nohup npx next start -p 3000 >/dev/null 2>&1 &)
node -e "(async()=>{for(let i=0;i<80;i++){try{await fetch('http://localhost:3000');return}catch{await new Promise(r=>setTimeout(r,500))}}process.exit(1)})()"
