const os = require('os');

function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (loopback) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }

    return 'localhost';
}

const ip = getLocalIPAddress();
const port = process.env.PORT || 3000;

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     📱 Access from iPad                                    ║
║                                                            ║
║     Open Safari on your iPad and navigate to:             ║
║                                                            ║
║     http://${ip}:${port}                        ║
║                                                            ║
║     Make sure your iPad is on the same WiFi network!      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

module.exports = { getLocalIPAddress };
